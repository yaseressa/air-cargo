package com.kq.fleet_and_cargo.enums;

import lombok.Getter;

@Getter
public enum Gender {
    MALE("MALE"),
    FEMALE("FEMALE");
    private final String gender;

    Gender(String gender) {
        this.gender = gender;
    }

}
