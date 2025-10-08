package com.kq.fleet_and_cargo.services;


import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.FXRates;
import com.kq.fleet_and_cargo.repositories.FXRateRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Currency;
import java.util.Set;

@Service
public record FXRateService(FXRateRepository fxExchangeRepository) {
    public FXRates createFXRate(FXRates fxRates) {
        String destCurr = fxRates.getDestinationCurrency();
        fxRates.setSourceCurrency("USD");
        if (!fxRates.getDestinationCurrency().equals("SLSH")) {
            try {
                destCurr = Currency.getInstance(fxRates.getDestinationCurrency()).getCurrencyCode();
            } catch (IllegalArgumentException e) {
                throw new NotFoundException("Invalid destination currency code: " + destCurr);
            }
        }
        return fxExchangeRepository.save(fxRates);

    }

    public Page<FXRates> getAllFXRates(String search, int page, int size, String sortBy, String order) {
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        if (search == null || search.isBlank()) {
            return fxExchangeRepository.findAll(pageable);
        } else {
            String formattedSearch = search.replaceFirst("^\\+|^0+", "").trim();
            return fxExchangeRepository.findAllBySourceCurrencyContainingOrDestinationCurrencyContaining(formattedSearch, pageable);
        }


    }

    public FXRates getFXRateById(String id) {
        return fxExchangeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FX Rate not found with id: " + id));
    }

    public FXRates updateFXRate(FXRates fxRates) {
        FXRates existingFXRate = getFXRateById(fxRates.getId());
        existingFXRate.setDestinationCurrency(fxRates.getDestinationCurrency());
        existingFXRate.setRate(fxRates.getRate());
        return fxExchangeRepository.save(existingFXRate);
    }

    public Set<String> getAllSupportedCurrencies() {
        Set<String> allSourceCurrencies = fxExchangeRepository.findAllSourceCurrencies();
        allSourceCurrencies.addAll(fxExchangeRepository.findAllDestinationCurrencies());
        return allSourceCurrencies;
    }

    public String deleteFXRate(String id) {
        FXRates existingFXRate = getFXRateById(id);
        fxExchangeRepository.delete(existingFXRate);
        return "FX Rate deleted successfully with id: " + id;
    }
}
