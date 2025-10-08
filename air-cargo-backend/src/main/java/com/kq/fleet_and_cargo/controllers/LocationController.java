package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.models.Location;
import com.kq.fleet_and_cargo.services.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
 @RequestMapping("/api/locations")
public record LocationController(LocationService locationService) {
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable String id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationService.createLocation(location));
    }

    @PutMapping
    public ResponseEntity<Location> updateLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationService.updateLocation(location));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLocation(@PathVariable String id) {
        return ResponseEntity.ok(locationService.deleteLocation(id));
    }


}
