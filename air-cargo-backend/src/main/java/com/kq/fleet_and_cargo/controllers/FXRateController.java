package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.models.FXRates;
import com.kq.fleet_and_cargo.services.FXRateService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/fx-rates")
public record FXRateController(
        FXRateService fxRateService
) {
    @PostMapping
    public ResponseEntity<FXRates> createFXRate(@RequestBody FXRates fxRates) {
        FXRates createdFXRate = fxRateService.createFXRate(fxRates);
        return ResponseEntity.ok(createdFXRate);
    }
    @GetMapping
    public ResponseEntity<Page<FXRates>> getAllFXRates(String search, int page, int size, String sortBy, String order) {
        Page<FXRates> fxRatesPage = fxRateService.getAllFXRates(search, page, size, sortBy, order);
        return ResponseEntity.ok(fxRatesPage);
    }
    @GetMapping("/{id}")
    public ResponseEntity<FXRates> getFXRateById(@PathVariable String id) {
        FXRates fxRates = fxRateService.getFXRateById(id);
        return ResponseEntity.ok(fxRates);
    }
    @PutMapping
    public ResponseEntity<FXRates> updateFXRate(@RequestBody FXRates fxRates) {
        FXRates updatedFXRate = fxRateService.updateFXRate( fxRates);
        return ResponseEntity.ok(updatedFXRate);
    }
    @GetMapping("/supported-currencies")
    public ResponseEntity<Set<String>> getSupportedCurrencies() {
        return ResponseEntity.ok(fxRateService.getAllSupportedCurrencies());
    }    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFXRate(@PathVariable String id) {
        String response = fxRateService.deleteFXRate(id);
        return ResponseEntity.ok(response);
    }
}
