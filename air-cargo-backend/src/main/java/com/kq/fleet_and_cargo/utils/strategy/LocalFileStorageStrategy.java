package com.kq.fleet_and_cargo.utils.strategy;

import com.kq.fleet_and_cargo.enums.StorageProvider;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.File;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Component
@Slf4j
public class LocalFileStorageStrategy implements FileStorageStrategy {

    @Value("${file.storage.local.dir:uploads}")
    private String localBaseDir;

    @Value("${file.storage.local.base-url:/files}")
    private String localBaseUrl;

    @Override
    public StorageProvider provider() {
        return StorageProvider.LOCAL;
    }

    @Override
    public File save(MultipartFile file) throws IOException {
        checkIfImage(file);

        String original = sanitize(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        // Store raw (unencoded) name in DB; the physical file lives under <localBaseDir>/files/
        String unique = UUID.randomUUID() + "-" + original;

        Path base = Paths.get(localBaseDir).toAbsolutePath().normalize();
        Path dir  = base.resolve("files");
        Files.createDirectories(dir);

        Path target = dir.resolve(unique).normalize();
        if (!target.startsWith(base)) throw new IOException("Invalid path traversal");

        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        try {
            Files.setPosixFilePermissions(target, EnumSet.of(
                    PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE,
                    PosixFilePermission.GROUP_READ, PosixFilePermission.OTHERS_READ
            ));
        } catch (UnsupportedOperationException ignored) { /* Windows/non-POSIX */ }

        log.info("Local save OK: {}", target);

        return File.builder()
                .fileName(original)
                .fileType(file.getContentType())
                .localPath(unique)   // <-- only the filename in DB (no "files/" prefix, no encoding)
                .s3ObjectKey(null)
                .build();
    }

    @Override
    public String buildUrl(File file) {
        String rel = normalizedRelative(file); // strips legacy prefixes and decodes once

        // Verify exists on disk at <localBaseDir>/files/<rel>
        Path base = Paths.get(localBaseDir).toAbsolutePath().normalize();
        Path path = base.resolve("files").resolve(rel).normalize();
        if (!path.startsWith(base) || !Files.exists(path)) {
            throw new NotFoundException("Local file not found: " + rel);
        }

        // Encode once for the public URL (space -> %20, keep slashes)
        String safeRel = encodePath(rel);

        String prefix = localBaseUrl.endsWith("/")
                ? localBaseUrl.substring(0, localBaseUrl.length() - 1)
                : localBaseUrl;

        return prefix + "/" + safeRel; // e.g. "/files/<encoded-uuid-name>.jpg"
    }

    @Override
    public void delete(File file) {
        String rel = normalizedRelative(file);
        try {
            Path base = Paths.get(localBaseDir).toAbsolutePath().normalize();
            Path path = base.resolve("files").resolve(rel).normalize();
            if (path.startsWith(base) && Files.exists(path)) {
                Files.delete(path);
            }
            log.info("Local delete OK: {}", rel);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete local file", e);
        }
    }

    // ---------- helpers ----------

    /** Accepts legacy DB values like "files/%20name.jpg" or "/files/%20..." and new raw filenames. */
    private String normalizedRelative(File file) {
        String rel = file.getLocalPath();
        if (rel == null || rel.isBlank()) throw new NotFoundException("No local path on file");

        rel = rel.replaceFirst("^/+", "");         // drop leading slashes
        if (rel.startsWith("files/")) rel = rel.substring(6); // strip "files/" if present

        // Decode once to normalize any previously-encoded values (prevents %2520)
        try { rel = URLDecoder.decode(rel, StandardCharsets.UTF_8); }
        catch (IllegalArgumentException ignored) {}
        return rel;
    }

    private static String encodePath(String p) {
        return Arrays.stream(p.split("/"))
                .map(seg -> URLEncoder.encode(seg, StandardCharsets.UTF_8).replace("+", "%20"))
                .reduce((a, b) -> a + "/" + b).orElse(p);
    }

    private static String sanitize(String name) {
        // Remove path separators and control chars; limit length for FS safety
        String cleaned = name.replace("\\", "_").replace("/", "_").trim();
        if (cleaned.length() > 255) cleaned = cleaned.substring(0, 255);
        return cleaned;
    }

    private void checkIfImage(MultipartFile file) {
        if (file == null || file.getContentType() == null ||
                !file.getContentType().toLowerCase(Locale.ROOT).startsWith("image")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }
}
