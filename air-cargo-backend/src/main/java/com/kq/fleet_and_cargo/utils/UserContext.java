package com.kq.fleet_and_cargo.utils;

import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.FXRates;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.repositories.FXRateRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public record UserContext(
        FXRateRepository fxRateRepository
) {
    public String getUserCurrencyCode() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User userDetails = (User) authentication.getPrincipal();
        return userDetails.getPreferredCurrencyCode();
    }

    public FXRates getUserFxRates() {
        return fxRateRepository.findByCurrencyCode(getUserCurrencyCode()).orElseThrow(() -> new NotFoundException("Fx Rate not found."));
    }

}
