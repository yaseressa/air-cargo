package com.kq.fleet_and_cargo.payload.request;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AuthRequest {
    private String email;
    private String password;
}
