package com.kq.fleet_and_cargo.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
@Getter
public class ConflictException extends RuntimeException {
    private final HttpStatus status = HttpStatus.CONFLICT;

    public ConflictException(String message) {
        super(message);
    }
}
