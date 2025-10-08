package com.kq.fleet_and_cargo.enums;

import lombok.Getter;

@Getter
public enum Trend {
    UP("UP"),
    DOWN("DOWN"),
    NEUTRAL("NEUTRAL");

    private final String trend;

    Trend(String trend) {
        this.trend = trend;
    }

}
