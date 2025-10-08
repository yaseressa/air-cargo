package com.kq.fleet_and_cargo.payload.request;

import com.kq.fleet_and_cargo.enums.UserRoles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled;
    private String phoneNumber;
    private Set<UserRoles> roles;
    private String role_type;
}
