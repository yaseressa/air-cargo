package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public record AnalyticsController(AnalyticsService analyticsService) {

    @GetMapping("/cargo")
    public ResponseEntity<Long> countCargo(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.countCargo(month));
    }

    @GetMapping("/cargo/customers")
    public ResponseEntity<Long> cargoCustomers(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.countCustomers(month));
    }

    @GetMapping("/cargo/graph")
    public ResponseEntity<Map<String, Long>> cargoGraph(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.getCargoCountBasedOnStatus(month));
    }

    @GetMapping("/cargo/customers/graph")
    public ResponseEntity<Map<String, Long>> cargoCustomersGraph(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.getCustomerRegistrationTrends(month));
    }
}
