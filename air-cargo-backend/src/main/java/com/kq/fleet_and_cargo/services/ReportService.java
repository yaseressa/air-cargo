package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
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
import java.util.List;

@Service
public record ReportService(CargoRepository cargoRepository,
                            CustomerRepository customerRepository) {

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
                row.createCell(1).setCellValue(rowData[1] != null ? Double.parseDouble(rowData[1].toString()) : 0.0);
            }
            resizeColumns(sheet, columns.length);
            return writeWorkbookToByteArray(workbook);
        }
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
