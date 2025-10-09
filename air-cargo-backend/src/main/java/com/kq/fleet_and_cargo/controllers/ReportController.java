package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.payload.response.CargoTypeSummaryResponse;
import com.kq.fleet_and_cargo.payload.response.ExpenseCurrencySummaryResponse;
import com.kq.fleet_and_cargo.payload.response.ExpenseMonthlyTrendResponse;
import com.kq.fleet_and_cargo.payload.response.PickupCityRevenueResponse;
import com.kq.fleet_and_cargo.services.ReportService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping("/cargos/pickup-city-revenue/preview")
    public ResponseEntity<List<PickupCityRevenueResponse>> getPickupCityRevenuePreview(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getPickupCityRevenuePreview(search, startDate, endDate));
    }

    @GetMapping("/cargos/type-distribution")
    public ResponseEntity<byte[]> getCargoTypeDistribution(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=CargoTypeDistribution.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateCargoTypeDistributionReport(startDate, endDate));
    }

    @GetMapping("/cargos/type-distribution/preview")
    public ResponseEntity<List<CargoTypeSummaryResponse>> getCargoTypeDistributionPreview(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getCargoTypeDistributionPreview(search, startDate, endDate));
    }

    @GetMapping("/expenses")
    public ResponseEntity<byte[]> getExpenseReport(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=Expenses.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateExpenseDetailedReport(search, startDate, endDate));
    }

    @GetMapping("/expenses/currency-breakdown")
    public ResponseEntity<byte[]> getExpenseCurrencySummary(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=ExpenseCurrencySummary.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateExpenseCurrencySummaryReport(search, startDate, endDate));
    }

    @GetMapping("/expenses/currency-breakdown/preview")
    public ResponseEntity<List<ExpenseCurrencySummaryResponse>> getExpenseCurrencySummaryPreview(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getExpenseCurrencySummary(search, startDate, endDate));
    }

    @GetMapping("/expenses/monthly-trend")
    public ResponseEntity<byte[]> getExpenseMonthlyTrend(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) throws Exception {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=ExpenseMonthlyTrend.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(reportService.generateExpenseMonthlyTrendReport(search, startDate, endDate));
    }

    @GetMapping("/expenses/monthly-trend/preview")
    public ResponseEntity<List<ExpenseMonthlyTrendResponse>> getExpenseMonthlyTrendPreview(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getExpenseMonthlyTrend(search, startDate, endDate));
    }
}
