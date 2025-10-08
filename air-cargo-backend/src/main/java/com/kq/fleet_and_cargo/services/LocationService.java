package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.Location;
import com.kq.fleet_and_cargo.repositories.LocationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public record LocationService(LocationRepository locationRepository, SimpMessagingTemplate messagingTemplate) {
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(String id) {
        return locationRepository.findById(id).orElseThrow(() -> new NotFoundException("Location not found"));
    }

    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    public Location updateLocation(Location location) {
        Location locationToUpdate = getLocationById(location.getId());
        locationToUpdate.setName(location.getName());
        locationToUpdate.setCountry(location.getCountry());
        return locationRepository.save(locationToUpdate);
    }


    public String deleteLocation(String id) {
        locationRepository.deleteById(id);
        return "Location deleted successfully";
    }
}
