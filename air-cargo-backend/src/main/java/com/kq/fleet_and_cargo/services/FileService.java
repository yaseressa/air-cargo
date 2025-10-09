package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.enums.StorageProvider;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.File;
import com.kq.fleet_and_cargo.repositories.FileRepository;
import com.kq.fleet_and_cargo.utils.strategy.FileStorageStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Slf4j
public class FileService {

    private final FileRepository fileRepository;
    private final Map<StorageProvider, FileStorageStrategy> storagesByType = new EnumMap<>(StorageProvider.class);

    public FileService(FileRepository fileRepository, List<FileStorageStrategy> storages) {
        this.fileRepository = fileRepository;
        for (FileStorageStrategy s : storages) {
            storagesByType.put(s.provider(), s);
        }
    }

    @Value("${file.storage.provider:S3}") // S3 | LOCAL
    private String storageProviderProp;

    @Value("${file.storage.local.dir:uploads}")
    private String localBaseDir;

    @Value("${file.storage.local.base-url:/files}")
    private String localBaseUrl;

    private StorageProvider configuredProvider() {
        try { return StorageProvider.valueOf(storageProviderProp.trim().toUpperCase(Locale.ROOT)); }
        catch (Exception e) { return StorageProvider.S3; }
    }

    // ======= PUBLIC API (unchanged signatures) =======

    /** Save using the configured provider (S3 or LOCAL). */
    @Transactional
    public File saveFile(MultipartFile file) throws IOException {
        FileStorageStrategy storage = storagesByType.get(configuredProvider());
        if (storage == null) throw new IllegalStateException("No storage bean for provider: " + storageProviderProp);

        File stored = storage.save(file);
        return fileRepository.save(stored);
    }

    /** Load a file and attach a transient public URL (fileUrl). */
    @Transactional(readOnly = true)
    public File getFile(String fileId) {
        File f = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found: " + fileId));

        FileStorageStrategy storage = selectStorageForRecord(f);
        f.setFileUrl(storage.buildUrl(f));   // Don't overwrite localPath/s3ObjectKey
        return f;
    }

    /** Delete from storage and DB. */
    @Transactional
    public void deleteFile(String fileId) {
        File f = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found: " + fileId));

        FileStorageStrategy storage = selectStorageForRecord(f);
        storage.delete(f);
        fileRepository.deleteById(fileId);
    }

    /** Convenience helper for places where you just need the URL. */
    public String buildPublicUrl(File f) {
        return selectStorageForRecord(f).buildUrl(f);
    }

    public FileView resolveForViewing(String fileUrl) {
        if (!hasText(fileUrl)) {
            throw new IllegalArgumentException("File URL must be provided");
        }

        String trimmed = fileUrl.trim();

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            try {
                return new FileView(null, null, new URI(trimmed));
            } catch (URISyntaxException e) {
                throw new NotFoundException("Invalid file URL");
            }
        }

        String normalized = extractLocalPath(trimmed);
        Path filePath = resolveLocalFile(normalized);

        try {
            UrlResource resource = new UrlResource(filePath.toUri());
            return new FileView(resource, detectMediaType(filePath), null);
        } catch (MalformedURLException e) {
            throw new NotFoundException("Unable to load file");
        }
    }

    // ======= Helpers =======

    private FileStorageStrategy selectStorageForRecord(File f) {
        if (hasText(f.getS3ObjectKey())) {
            FileStorageStrategy s3 = storagesByType.get(StorageProvider.S3);
            if (s3 == null) throw new IllegalStateException("S3 storage not available");
            return s3;
        }
        if (hasText(f.getLocalPath())) {
            FileStorageStrategy local = storagesByType.get(StorageProvider.LOCAL);
            if (local == null) throw new IllegalStateException("Local storage not available");
            return local;
        }
        throw new IllegalStateException("File record has neither s3ObjectKey nor localPath");
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private String extractLocalPath(String url) {
        String candidate = url;
        try {
            URI uri = new URI(candidate);
            if (uri.isAbsolute()) {
                candidate = uri.getPath();
            }
        } catch (URISyntaxException ignored) {
        }

        if (candidate == null) {
            throw new NotFoundException("File not found");
        }

        String localPrefix = localBaseUrl.startsWith("/") ? localBaseUrl : "/" + localBaseUrl;
        String normalized = candidate.startsWith("/") ? candidate : "/" + candidate;

        if (normalized.startsWith(localPrefix)) {
            normalized = normalized.substring(localPrefix.length());
        }

        normalized = normalized.replaceFirst("^/+", "");

        try {
            normalized = URLDecoder.decode(normalized, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ignored) {
        }

        if (!hasText(normalized)) {
            throw new NotFoundException("File not found");
        }

        return normalized;
    }

    private Path resolveLocalFile(String relativePath) {
        Path base = Paths.get(localBaseDir).toAbsolutePath().normalize();
        Path resolved = base.resolve("files").resolve(relativePath).normalize();

        if (!resolved.startsWith(base) || !Files.exists(resolved)) {
            throw new NotFoundException("File not found");
        }

        return resolved;
    }

    private MediaType detectMediaType(Path path) {
        try {
            String detected = Files.probeContentType(path);
            if (detected != null) {
                return MediaType.parseMediaType(detected);
            }
        } catch (IOException ignored) {
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public record FileView(Resource resource, MediaType mediaType, URI redirectUri) {
        public boolean isRedirect() {
            return redirectUri != null;
        }
    }
}
