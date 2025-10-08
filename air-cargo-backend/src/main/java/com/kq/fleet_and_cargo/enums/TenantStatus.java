package com.kq.fleet_and_cargo.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum TenantStatus {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    SUSPENDED("SUSPENDED");
    private final String status;

}
