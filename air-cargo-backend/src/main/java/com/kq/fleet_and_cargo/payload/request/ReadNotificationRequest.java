package com.kq.fleet_and_cargo.payload.request;

import lombok.Data;

import java.util.List;

@Data
public class ReadNotificationRequest {
    private List<String> notificationIds;
}