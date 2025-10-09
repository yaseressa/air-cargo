package com.kq.fleet_and_cargo.payload.response;

import java.math.BigDecimal;

public record ExpenseMonthlyTrendResponse(
        String period,
        String currencyCode,
        BigDecimal totalAmount
) {
}
