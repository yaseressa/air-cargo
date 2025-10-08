package com.kq.fleet_and_cargo.utils.strategy;


import com.kq.fleet_and_cargo.enums.StorageProvider;
import com.kq.fleet_and_cargo.models.File;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageStrategy {
    StorageProvider provider();
    File save(MultipartFile file) throws IOException;
    String buildUrl(File file);
    void delete(File file);
}
