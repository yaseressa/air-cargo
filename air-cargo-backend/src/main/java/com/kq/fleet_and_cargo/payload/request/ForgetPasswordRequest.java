package com.kq.fleet_and_cargo.payload.request;

import lombok.Data;

@Data
public class ForgetPasswordRequest {
    private String email;
    private String otp;
    private String password;
}
