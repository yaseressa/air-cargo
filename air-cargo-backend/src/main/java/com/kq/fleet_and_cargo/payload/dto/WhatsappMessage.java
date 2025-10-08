package com.kq.fleet_and_cargo.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
public class WhatsappMessage {
    private String to;
    private String message;
}
