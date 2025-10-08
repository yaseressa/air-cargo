package com.kq.fleet_and_cargo.payload.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.kq.fleet_and_cargo.enums.UserRoles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled;
    private String phoneNumber;
    private String token;
    private String preferredCurrencyCode;
    private Set<UserRoles> roles;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime updatedAt;


}
