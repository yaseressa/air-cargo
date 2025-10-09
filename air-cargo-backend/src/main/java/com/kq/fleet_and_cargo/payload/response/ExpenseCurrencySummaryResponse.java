package com.kq.fleet_and_cargo.payload.response;

import java.math.BigDecimal;

public record ExpenseCurrencySummaryResponse(
        String currencyCode,
        BigDecimal totalAmount,
        long expenseCount
) {
}
