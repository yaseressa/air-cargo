package com.kq.fleet_and_cargo.advice;

import com.kq.fleet_and_cargo.exceptions.ConflictException;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionAdvice {
    @ExceptionHandler({NotFoundException.class})
    public ErrorResponse handleNoSuchElementException(NotFoundException e) {
        return ErrorResponse.builder(e, e.getStatus(), e.getMessage()).build();
    }
    @ExceptionHandler(UsernameNotFoundException.class)
    public ErrorResponse handleUsernameNotFoundException(UsernameNotFoundException e) {
        return ErrorResponse.builder(e, HttpStatus.UNAUTHORIZED, e.getMessage()).build();
    }
    @ExceptionHandler(JwtException.class)
    public ErrorResponse handleUsernameNotFoundException(JwtException e) {
        return ErrorResponse.builder(e, HttpStatus.UNAUTHORIZED, e.getMessage()).build();
    }
    @ExceptionHandler({ConflictException.class})
    public ErrorResponse handleConflictException(ConflictException e) {
        return ErrorResponse.builder(e, e.getStatus(), e.getMessage()).build();
    }

}
