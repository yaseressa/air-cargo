package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.models.Expense;
import com.kq.fleet_and_cargo.payload.response.CargoTypeSummaryResponse;
import com.kq.fleet_and_cargo.payload.response.ExpenseCurrencySummaryResponse;
import com.kq.fleet_and_cargo.payload.response.ExpenseMonthlyTrendResponse;
import com.kq.fleet_and_cargo.payload.response.PickupCityRevenueResponse;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
import com.kq.fleet_and_cargo.repositories.ExpenseRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public record ReportService(CargoRepository cargoRepository,
                            CustomerRepository customerRepository,
                            ExpenseRepository expenseRepository) {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Africa/Mogadishu");
    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public synchronized byte[] generateCargoExcelReportWithHeader(String search, String startDate, String endDate) throws IOException {
        DateRange range = resolveRange(startDate, endDate);
        List<Cargo> cargos = cargoRepository.findAllByDateNoPaging(search, range.start(), range.end());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Cargos");
            String[] columns = {"Date", "Sender", "Receiver", "Pickup", "Destination", "Description", "Weight", "Quantity", "Cargo Type"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (Cargo cargo : cargos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(formatDate(cargo.getCreatedAt()));
                row.createCell(1).setCellValue(formatCustomerName(cargo.getSender()));
                row.createCell(2).setCellValue(formatCustomerName(cargo.getReceiver()));
                row.createCell(3).setCellValue(nullSafe(cargo.getPickupLocation()));
                row.createCell(4).setCellValue(nullSafe(cargo.getDestination()));
                row.createCell(5).setCellValue(nullSafe(cargo.getDescription()));
                row.createCell(6).setCellValue(cargo.getWeight());
                row.createCell(7).setCellValue(cargo.getQuantity());
                row.createCell(8).setCellValue(nullSafe(cargo.getCargoType()));
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public synchronized byte[] generateCustomerExcelReportWithHeader(String search, String startDate, String endDate) throws IOException {
        DateRange range = resolveRange(startDate, endDate);
        List<Customer> customers = customerRepository.findAllByDateWithNoPaging(search, range.start(), range.end());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Customers");
            String[] columns = {"ID", "Name", "Email", "Phone Number", "Address", "Gender"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (Customer customer : customers) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(nullSafe(customer.getId()));
                row.createCell(1).setCellValue((nullSafe(customer.getFirstName()) + " " + nullSafe(customer.getLastName())).trim());
                row.createCell(2).setCellValue(nullSafe(customer.getEmail()));
                row.createCell(3).setCellValue(nullSafe(customer.getPhoneNumber()));
                row.createCell(4).setCellValue(nullSafe(customer.getAddress()));
                row.createCell(5).setCellValue(customer.getGender() != null ? customer.getGender().name() : "");
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public synchronized byte[] generatePickupCityRevenueReport(String startDate, String endDate) throws IOException {
        DateRange range = resolveRange(startDate, endDate);
        List<Object[]> rows = cargoRepository.findRevenueByPickupCity(range.start(), range.end());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Pickup Revenue");
            String[] columns = {"Pickup Location", "Total Revenue"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (Object[] rowData : rows) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rowData[0] != null ? rowData[0].toString() : "Unknown");
                row.createCell(1).setCellValue(rowData[1] != null ? ((Number) rowData[1]).doubleValue() : 0.0);
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public List<PickupCityRevenueResponse> getPickupCityRevenuePreview(String search, String startDate, String endDate) {
        DateRange range = resolveRange(startDate, endDate);
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);

        return cargoRepository.findRevenueByPickupCity(range.start(), range.end()).stream()
                .map(row -> new PickupCityRevenueResponse(
                        row[0] != null ? row[0].toString() : "Unknown",
                        row[1] != null ? ((Number) row[1]).doubleValue() : 0.0
                ))
                .filter(response -> normalizedSearch.isBlank() ||
                        response.pickupLocation().toLowerCase(Locale.ROOT).contains(normalizedSearch))
                .collect(Collectors.toList());
    }

    public synchronized byte[] generateCargoTypeDistributionReport(String startDate, String endDate) throws IOException {
        DateRange range = resolveRange(startDate, endDate);
        List<Object[]> rows = cargoRepository.findCargoTypeDistribution(range.start(), range.end());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Cargo Type Distribution");
            String[] columns = {"Cargo Type", "Total Shipments", "Total Revenue"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (Object[] rowData : rows) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rowData[0] != null ? rowData[0].toString() : "Unknown");
                row.createCell(1).setCellValue(rowData[1] != null ? ((Number) rowData[1]).longValue() : 0L);
                row.createCell(2).setCellValue(rowData[2] != null ? ((Number) rowData[2]).doubleValue() : 0.0);
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public List<CargoTypeSummaryResponse> getCargoTypeDistributionPreview(String search, String startDate, String endDate) {
        DateRange range = resolveRange(startDate, endDate);
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);

        return cargoRepository.findCargoTypeDistribution(range.start(), range.end()).stream()
                .map(row -> new CargoTypeSummaryResponse(
                        row[0] != null ? row[0].toString() : "Unknown",
                        row[1] != null ? ((Number) row[1]).longValue() : 0L,
                        row[2] != null ? ((Number) row[2]).doubleValue() : 0.0
                ))
                .filter(response -> normalizedSearch.isBlank() ||
                        response.cargoType().toLowerCase(Locale.ROOT).contains(normalizedSearch))
                .collect(Collectors.toList());
    }

    public synchronized byte[] generateExpenseDetailedReport(String search, String startDate, String endDate) throws IOException {
        DateRange range = resolveRange(startDate, endDate);
        String normalizedSearch = normalizeSearch(search);
        List<Expense> expenses = expenseRepository.findAllWithinRange(normalizedSearch, range.start(), range.end());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses");
            String[] columns = {"Date", "Description", "Amount", "Currency", "Created At"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(formatDate(expense.getIncurredAt()));
                row.createCell(1).setCellValue(nullSafe(expense.getDescription()));
                row.createCell(2).setCellValue(expense.getAmount() != null ? expense.getAmount().getAmount().doubleValue() : 0.0);
                row.createCell(3).setCellValue(expense.getAmount() != null ? expense.getAmount().getCurrencyCode() : "");
                row.createCell(4).setCellValue(formatDate(expense.getCreatedAt()));
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public List<ExpenseCurrencySummaryResponse> getExpenseCurrencySummary(String search, String startDate, String endDate) {
        DateRange range = resolveRange(startDate, endDate);
        String normalizedSearch = normalizeSearch(search);

        return expenseRepository.summarizeByCurrency(normalizedSearch, range.start(), range.end()).stream()
                .map(row -> new ExpenseCurrencySummaryResponse(
                        (String) row[0],
                        toBigDecimal(row[1]),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    public synchronized byte[] generateExpenseCurrencySummaryReport(String search, String startDate, String endDate) throws IOException {
        List<ExpenseCurrencySummaryResponse> summaries = getExpenseCurrencySummary(search, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expense Currency Summary");
            String[] columns = {"Currency", "Total Amount", "Number of Expenses"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (ExpenseCurrencySummaryResponse summary : summaries) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(summary.currencyCode());
                row.createCell(1).setCellValue(summary.totalAmount().doubleValue());
                row.createCell(2).setCellValue(summary.expenseCount());
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    public List<ExpenseMonthlyTrendResponse> getExpenseMonthlyTrend(String search, String startDate, String endDate) {
        DateRange range = resolveRange(startDate, endDate);
        String normalizedSearch = normalizeSearch(search);

        return expenseRepository.summarizeByMonth(normalizedSearch, range.start(), range.end()).stream()
                .map(row -> new ExpenseMonthlyTrendResponse(
                        formatPeriod(row[0]),
                        (String) row[1],
                        toBigDecimal(row[2])
                ))
                .collect(Collectors.toList());
    }

    public synchronized byte[] generateExpenseMonthlyTrendReport(String search, String startDate, String endDate) throws IOException {
        List<ExpenseMonthlyTrendResponse> trends = getExpenseMonthlyTrend(search, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expense Monthly Trend");
            String[] columns = {"Period", "Currency", "Total Amount"};
            createHeaderRow(sheet, columns);
            int rowNum = 1;
            for (ExpenseMonthlyTrendResponse trend : trends) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(trend.period());
                row.createCell(1).setCellValue(trend.currencyCode());
                row.createCell(2).setCellValue(trend.totalAmount().doubleValue());
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return BigDecimal.ZERO;
    }

    private String formatPeriod(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof ZonedDateTime zonedDateTime) {
            return String.format(
                    "%s %d",
                    zonedDateTime.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    zonedDateTime.getYear()
            );
        }
        if (value instanceof LocalDateTime localDateTime) {
            return String.format(
                    "%s %d",
                    localDateTime.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    localDateTime.getYear()
            );
        }
        return value.toString();
    }

    private void createHeaderRow(Sheet sheet, String[] columns) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            headerRow.createCell(i).setCellValue(columns[i]);
        }
    }

    private void resizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private byte[] writeWorkbookToByteArray(Workbook workbook) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String formatDate(ZonedDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return dateTime.withZoneSameInstant(DEFAULT_ZONE).format(DISPLAY_FORMAT);
    }

    private String formatCustomerName(Customer customer) {
        if (customer == null) {
            return "";
        }
        return (nullSafe(customer.getFirstName()) + " " + nullSafe(customer.getLastName())).trim();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private DateRange resolveRange(String startDate, String endDate) {
        ZonedDateTime end = parseDate(endDate);
        ZonedDateTime start = parseDate(startDate);

        if (end == null) {
            end = ZonedDateTime.now(DEFAULT_ZONE);
        }
        if (start == null) {
            start = end.minusMonths(6);
        }
        if (start.isAfter(end)) {
            ZonedDateTime temp = start;
            start = end;
            end = temp;
        }
        return new DateRange(start, end);
    }

    private ZonedDateTime parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return ZonedDateTime.parse(value).withZoneSameInstant(DEFAULT_ZONE);
        } catch (DateTimeParseException ignored) {
            try {
                LocalDateTime local = LocalDateTime.parse(value);
                return local.atZone(DEFAULT_ZONE);
            } catch (DateTimeParseException inner) {
                throw new IllegalArgumentException("Invalid date format: " + value, inner);
            }
        }
    }

    private record DateRange(ZonedDateTime start, ZonedDateTime end) {}
}
