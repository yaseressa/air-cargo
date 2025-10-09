package com.kq.fleet_and_cargo.controllers;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.zip.DataFormatException;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.CargoTrackingHistory;
import com.kq.fleet_and_cargo.models.File;
import com.kq.fleet_and_cargo.payload.dto.CargoDto;
import com.kq.fleet_and_cargo.payload.request.PublicCargoTrackingRequest;
import com.kq.fleet_and_cargo.services.CargoService;
import com.kq.fleet_and_cargo.services.CargoTrackingHistoryService;

@RestController
@RequestMapping("/api/cargos")
public record CargoController(CargoService cargoService, ModelMapper modelMapper,
        CargoTrackingHistoryService cargoTrackingHistoryService) {
    @GetMapping
    public ResponseEntity<Page<CargoDto>> getCargos(@RequestParam int page, @RequestParam int size,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String order,
            @RequestParam(required = false, defaultValue = "") String startDate,
            @RequestParam(required = false, defaultValue = "") String endDate,
            @RequestParam(required = false, defaultValue = "") String pickupLocation,
            @RequestParam(required = false, defaultValue = "") String destination) {
        return ResponseEntity.ok(
                cargoService.findAll(search, page, size, sortBy, order, startDate, endDate, pickupLocation, destination)
                        .map(cargo -> modelMapper.map(cargo, CargoDto.class)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CargoDto> getCargo(@PathVariable("id") String id) {
        return ResponseEntity.ok(modelMapper.map(cargoService.findById(id), CargoDto.class));
    }

    @PostMapping
    public ResponseEntity<Cargo> createCargo(@RequestBody Cargo luggage,
            @RequestParam(required = false, defaultValue = "false") boolean sendWhatsApp) {
        return ResponseEntity.ok(cargoService.create(luggage, sendWhatsApp));
    }

    @PutMapping
    public ResponseEntity<Cargo> updateCargo(@RequestBody Cargo luggage) {
        return ResponseEntity.ok(cargoService.update(luggage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCargo(@PathVariable String id) {
        String deleted = cargoService.delete(id);
        return ResponseEntity.ok(deleted);
    }

    @DeleteMapping("/file/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable("id") String id) {
        String deleted = cargoService.deleteFile(id);
        return ResponseEntity.ok(deleted);
    }

    @PostMapping("/{cargoId}/file")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
            @PathVariable("cargoId") String cargoId) throws Exception {
        return ResponseEntity.ok(cargoService.saveFile(cargoId, file));
    }

    @GetMapping("/file/{id}")
    public ResponseEntity<File> getFile(@PathVariable("id") String id) {
        File file = cargoService.getFile(id);
        return ResponseEntity.ok()
                .body(file);
    }

    @GetMapping("/{cargoId}/files")
    public ResponseEntity<List<File>> getFiles(@PathVariable("cargoId") String id)
            throws DataFormatException, IOException {
        return ResponseEntity.ok(cargoService.getFiles(id));
    }

    @GetMapping("/send-cargo-info/{cargoId}")
    public ResponseEntity<String> sendWhatsAppMessage(@PathVariable String cargoId) {
        return ResponseEntity.ok(cargoService.sendCargoInfo(cargoId));
    }

    @GetMapping("tracking/public/{id}")
    public ResponseEntity<Set<PublicCargoTrackingRequest>> getCargoTrackingHistories(@PathVariable String id) {
        return ResponseEntity.ok(cargoTrackingHistoryService.publicFindById(id));
    }

    @GetMapping("tracking/{id}")
    public ResponseEntity<Set<CargoTrackingHistory>> getCargoTrackingHistory(@PathVariable String id) {
        return ResponseEntity.ok(cargoTrackingHistoryService.find(id));
    }

    @PostMapping("tracking")
    public ResponseEntity<CargoTrackingHistory> createCargoTrackingHistory(
            @RequestBody CargoTrackingHistory cargoTrackingHistory) {
        return ResponseEntity.ok(cargoTrackingHistoryService.save(cargoTrackingHistory));
    }

    @PutMapping("tracking")
    public ResponseEntity<CargoTrackingHistory> updateCargoTrackingHistory(
            @RequestBody CargoTrackingHistory cargoTrackingHistory) {
        return ResponseEntity.ok(cargoTrackingHistoryService.update(cargoTrackingHistory));
    }
}
