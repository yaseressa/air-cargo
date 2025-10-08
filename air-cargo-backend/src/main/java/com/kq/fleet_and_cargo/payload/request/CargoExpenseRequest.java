package com.kq.fleet_and_cargo.payload.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

public record CargoExpenseRequest(
        String description,
        BigDecimal amount,
        String currencyCode,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        ZonedDateTime incurredAt
) {
}
