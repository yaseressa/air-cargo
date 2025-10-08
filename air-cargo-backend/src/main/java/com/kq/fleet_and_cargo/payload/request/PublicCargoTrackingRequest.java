package com.kq.fleet_and_cargo.payload.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.LuggageStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
public class PublicCargoTrackingRequest {
    private String id;
    @JsonIgnoreProperties({"trackingHistory", "files"})
    private Cargo cargo;
    private String location;
    private List<LuggageStatus> history;

    private String description;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu") private ZonedDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private ZonedDateTime updatedAt;
}
