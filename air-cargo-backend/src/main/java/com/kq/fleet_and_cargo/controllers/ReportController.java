package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.services.ReportService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public record ReportController(ReportService reportService) {

    @GetMapping("/customers")
    public ResponseEntity<byte[]> generateCustomerReport(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=CustomerReports.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateCustomerExcelReportWithHeader(search, startDate, endDate));
    }

    @GetMapping("/cargos")
    public ResponseEntity<byte[]> generateCargoReport(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=CargoReports.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateCargoExcelReportWithHeader(search, startDate, endDate));
    }

    @GetMapping("/cargos/pickup-city-revenue")
    public ResponseEntity<byte[]> getPickupCityRevenue(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=PickupCityRevenue.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generatePickupCityRevenueReport(startDate, endDate));
    }
}
