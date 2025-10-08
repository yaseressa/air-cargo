package com.kq.fleet_and_cargo.payload.dto;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.models.Money;

import lombok.Data;

@Data
public class CargoDto {

    private String id;
    private double weight;
    private String pickupLocation;
    private String destination;
    private LuggageStatusEnum status;
    private String description;
    @JsonIgnoreProperties({"sentCargo", "receivedCargo"})
    private Customer sender;
    @JsonIgnoreProperties({"sentCargo", "receivedCargo"})
    private Customer receiver;
    private Long referenceNumber;
    private String cargoType;
    private int quantity;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime updatedAt;
    
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu") private ZonedDateTime createdAt;
    private Money price;
    public double getTotalWeight() {
        return weight * quantity;
    }
}
