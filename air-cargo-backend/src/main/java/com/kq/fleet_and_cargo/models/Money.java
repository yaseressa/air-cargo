package com.kq.fleet_and_cargo.models;

import com.kq.fleet_and_cargo.exceptions.ConflictException;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

@Getter
@Embeddable
@Slf4j
public class Money {

    private static final int DEFAULT_SCALE = 4;
    private static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_EVEN;
    private static final MathContext DEFAULT_MATH_CONTEXT = MathContext.DECIMAL128;

    @Column(name = "amount", precision = 19, scale = DEFAULT_SCALE, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false)
    private String currencyCode;

    protected Money() {
    }

    public Money(BigDecimal amount, Currency currency) {
        this(amount, currency.getCurrencyCode());
    }

    public Money(BigDecimal amount, String currencyCode) {
        Objects.requireNonNull(amount, "Amount must not be null");
        Objects.requireNonNull(currencyCode, "Currency code must not be null");
        if (currencyCode.length() < 3) {
            throw new IllegalArgumentException("Currency code must be 3 characters");
        }

        this.amount = amount.setScale(DEFAULT_SCALE, DEFAULT_ROUNDING);
        this.currencyCode = currencyCode.toUpperCase();
    }

    public static Money zero(Currency currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public static Money zero(String currencyCode) {
        return new Money(BigDecimal.ZERO, currencyCode);
    }



    public Money add(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currencyCode);
    }

    public Money subtract(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currencyCode);
    }

    public Money multiply(BigDecimal multiplier) {
        return new Money(
                this.amount.multiply(multiplier, DEFAULT_MATH_CONTEXT),
                this.currencyCode
        );
    }

    public Money divide(BigDecimal divisor) {
        return new Money(
                this.amount.divide(divisor, DEFAULT_MATH_CONTEXT),
                this.currencyCode
        );
    }

    public boolean isSameCurrency(Money other) {
        return this.currencyCode.equalsIgnoreCase(other.currencyCode);
    }

    public boolean isZero() {
        return amount.compareTo(BigDecimal.ZERO) == 0;
    }

    public boolean isPositive() {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNegative() {
        return amount.compareTo(BigDecimal.ZERO) < 0;
    }

    private void ensureSameCurrency(Money other) {
        if (!isSameCurrency(other)) {
            throw new CurrencyMismatchException(this.currencyCode, other.currencyCode);
        }
    }

    public Money exchange(FXRates fxRates, boolean reverse) {


        BigDecimal newAmount;
        String newCurrency;

        if (reverse) {
            newAmount = this.amount.multiply(
                    BigDecimal.valueOf(fxRates.getRate()),
                    DEFAULT_MATH_CONTEXT
            );
            newCurrency = fxRates.getDestinationCurrency();
        } else {
            newAmount = this.amount.divide(
                    BigDecimal.valueOf(fxRates.getRate()),
                    DEFAULT_MATH_CONTEXT
            );
            newCurrency = fxRates.getSourceCurrency();

        }
        return new Money(newAmount, newCurrency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.compareTo(money.amount) == 0 &&
                currencyCode.equalsIgnoreCase(money.currencyCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currencyCode.toUpperCase());
    }

    @Override
    public String toString() {
        return amount.stripTrailingZeros().toPlainString() + " " + currencyCode;
    }

    public static class CurrencyMismatchException extends IllegalArgumentException {
        public CurrencyMismatchException(String expected, String actual) {
            super(String.format("Currency mismatch: expected %s but was %s", expected, actual));
        }
    }
}