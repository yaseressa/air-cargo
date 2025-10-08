package com.kq.fleet_and_cargo.enums;

public enum UserRoles {
    ADMIN("ADMIN"),
    USER("USER");

    private final String role;

    UserRoles(String role) {
        this.role = role;
    }

    public String getRoleType() {
        return role;
    }
}
