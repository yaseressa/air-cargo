package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping("/view")
    public ResponseEntity<?> viewFile(@RequestParam("url") String url) {
        FileService.FileView view = fileService.resolveForViewing(url);
        if (view.isRedirect()) {
            return ResponseEntity.status(HttpStatus.FOUND).location(view.redirectUri()).build();
        }

        return ResponseEntity.ok()
                .contentType(view.mediaType())
                .body(view.resource());
    }
}
