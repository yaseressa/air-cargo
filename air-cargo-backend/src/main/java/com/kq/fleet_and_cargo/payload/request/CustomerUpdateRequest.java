package com.kq.fleet_and_cargo.payload.request;

import com.kq.fleet_and_cargo.enums.Gender;
import com.kq.fleet_and_cargo.models.Cargo;
import lombok.Data;

import java.util.Set;

@Data
public class CustomerUpdateRequest {
    private  String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private Gender gender;
    private Set<Cargo> receivedCargo;
    private Set<Cargo> sentCargo;

}
