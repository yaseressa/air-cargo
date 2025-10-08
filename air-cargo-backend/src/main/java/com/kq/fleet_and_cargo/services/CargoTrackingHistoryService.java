package com.kq.fleet_and_cargo.services;

import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.CargoTrackingHistory;
import com.kq.fleet_and_cargo.models.LuggageStatus;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.request.PublicCargoTrackingRequest;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CargoTrackingHistoryRepository;
import com.kq.fleet_and_cargo.repositories.LuggageStatusRepository;

@Service
public record CargoTrackingHistoryService(CargoRepository cargoRepository, ModelMapper modelMapper, CargoTrackingHistoryRepository cargoTrackingHistoryRepository, UserService userService, LuggageStatusRepository luggageStatusRepository) {

    public Set<PublicCargoTrackingRequest> publicFindById(String id) {
        return find(id)
                .stream()
                .map(cargo -> modelMapper.map(cargo, PublicCargoTrackingRequest.class))
                .collect(Collectors.toSet());
    }

    public CargoTrackingHistory save(CargoTrackingHistory cargoTrackingHistory) {
        var cargo = cargoRepository.findById(cargoTrackingHistory.getCargo().getId())
                .orElseThrow(() -> new NotFoundException("Cargo not found"));
        User user = userService.findById(cargoTrackingHistory.getCreatedBy().getId());

        cargoTrackingHistory.setCargo(cargo);
        cargoTrackingHistory.setCreatedBy(user);

        var history = new ArrayList<>(cargoTrackingHistory.getHistory());
        cargoTrackingHistory.setHistory(new ArrayList<>());

        var saved = cargoTrackingHistoryRepository.save(cargoTrackingHistory);

        for (var luggageStatus : history) {
            luggageStatus.setTrackingHistory(saved);
            luggageStatusRepository.save(luggageStatus);
        }

        return saved;
    }


    public Set<CargoTrackingHistory> findById(String id) {
        return find(id);
    }

    public Set<CargoTrackingHistory> find(String id) {
        return cargoRepository.findByCargoId(id)
                .orElseThrow(() -> new NotFoundException("Cargo tracking history not found"));
    }

    public CargoTrackingHistory update(CargoTrackingHistory cargoTrackingHistory) {
        CargoTrackingHistory cargoTrackingHistoryNotFound = cargoTrackingHistoryRepository.findById(cargoTrackingHistory.getId())
                .orElseThrow(() -> new NotFoundException("Cargo tracking history not found"));
        cargoTrackingHistoryNotFound.setLocation(cargoTrackingHistory.getLocation());
        cargoTrackingHistoryNotFound.setDescription(cargoTrackingHistory.getDescription());
        for (var luggageStatus : cargoTrackingHistory.getHistory()) {
            addLuggageStatus(cargoTrackingHistoryNotFound, luggageStatus.getStatus().name());
        }
        return cargoTrackingHistoryRepository.save(cargoTrackingHistoryNotFound);
    }

    private void addLuggageStatus(CargoTrackingHistory cargoTrackingHistory, String status) {
        for (var luggageStatus : cargoTrackingHistory.getHistory()) {
            if (luggageStatus.getStatus().equals(LuggageStatusEnum.valueOf(status))) {
               return;
            }
        }
        cargoTrackingHistory.getHistory().add(luggageStatusRepository.save(LuggageStatus.builder().status(LuggageStatusEnum.valueOf(status)).trackingHistory(cargoTrackingHistory).build()));
        cargoTrackingHistoryRepository.save(cargoTrackingHistory);

    }

    public void delete(String id) {
        cargoTrackingHistoryRepository.deleteById(id);
    }
}
