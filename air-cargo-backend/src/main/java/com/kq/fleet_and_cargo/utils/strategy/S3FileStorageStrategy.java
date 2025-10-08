package com.kq.fleet_and_cargo.utils.strategy;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.kq.fleet_and_cargo.enums.StorageProvider;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class S3FileStorageStrategy implements FileStorageStrategy {

    // Optional to allow running app without an S3 bean when LOCAL is used
    private final Optional<AmazonS3> s3;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration-ms:3600000}") // 1 hour
    private long presignedUrlExpirationMs;

    @Override
    public StorageProvider provider() {
        return StorageProvider.S3;
    }

    @Override
    public File save(MultipartFile file) throws IOException {
        checkIfImage(file);
        AmazonS3 client = s3.orElseThrow(() ->
                new IllegalStateException("S3 storage selected but AmazonS3 bean is missing"));

        String original = Objects.requireNonNullElse(file.getOriginalFilename(), "file");
        // Keep the key URL-safe (encode only the filename segment)
        String encoded = URLEncoder.encode(original, StandardCharsets.UTF_8).replace("+", "%20");
        String unique = UUID.randomUUID() + "-" + encoded;
        String key = "files/" + unique;

        try {
            ObjectMetadata md = new ObjectMetadata();
            md.setContentType(file.getContentType());
            md.setContentLength(file.getSize());
            client.putObject(bucketName, key, file.getInputStream(), md);
            log.info("S3 upload OK: {}", key);

            return File.builder()
                    .fileName(original)
                    .fileType(file.getContentType())
                    .s3ObjectKey(key)
                    .localPath(null)
                    .build();
        } catch (AmazonServiceException e) {
            log.error("S3 upload failed: {} (status {})", e.getErrorMessage(), e.getStatusCode());
            throw new IOException("Failed to upload to S3", e);
        }
    }

    @Override
    public String buildUrl(File file) {
        AmazonS3 client = s3.orElseThrow(() ->
                new IllegalStateException("S3 storage selected but AmazonS3 bean is missing"));

        String key = file.getS3ObjectKey();
        if (key == null || key.isBlank()) throw new NotFoundException("No S3 key on file");

        if (!client.doesObjectExist(bucketName, key)) {
            throw new NotFoundException("S3 object not found: " + key);
        }

        Date exp = new Date(System.currentTimeMillis() + presignedUrlExpirationMs);
        return client.generatePresignedUrl(new GeneratePresignedUrlRequest(bucketName, key)
                .withMethod(HttpMethod.GET)
                .withExpiration(exp)).toString();
    }

    @Override
    public void delete(File file) {
        AmazonS3 client = s3.orElseThrow(() ->
                new IllegalStateException("S3 storage selected but AmazonS3 bean is missing"));

        String key = file.getS3ObjectKey();
        if (key == null || key.isBlank()) throw new NotFoundException("No S3 key on file");

        client.deleteObject(bucketName, key);
        log.info("S3 delete OK: {}", key);
    }

    private void checkIfImage(MultipartFile file) {
        if (file == null || file.getContentType() == null ||
                !file.getContentType().toLowerCase(Locale.ROOT).startsWith("image")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }
}
