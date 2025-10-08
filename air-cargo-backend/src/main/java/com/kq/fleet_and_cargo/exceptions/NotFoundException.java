package com.kq.fleet_and_cargo.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class NotFoundException extends RuntimeException {
    private final HttpStatus status = HttpStatus.NOT_FOUND;
    public NotFoundException(String message) {
        super(message);
    }
}
