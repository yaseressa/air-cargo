package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
import com.kq.fleet_and_cargo.repositories.LuggageStatusRepository;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public record AnalyticsService(CargoRepository cargoRepository,
                               LuggageStatusRepository luggageStatusRepository,
                               CustomerRepository customerRepository) {

    public Long countCargo(String month) {
        DateRange range = resolveRange(month);
        if (range == null) {
            return cargoRepository.count();
        }
        return cargoRepository.countWithDate(range.start(), range.end());
    }

    public Long countCustomers(String month) {
        DateRange range = resolveRange(month);
        if (range == null) {
            return customerRepository.count();
        }
        return customerRepository.countWithDate(range.start(), range.end());
    }

    public Map<String, Long> getCargoCountBasedOnStatus(String month) {
        DateRange range = resolveRange(month);
        Map<String, Long> cargoData = new LinkedHashMap<>();

        cargoData.put(
                "Delivered",
                range == null
                        ? luggageStatusRepository.countByStatus(LuggageStatusEnum.DELIVERED)
                        : luggageStatusRepository.countByStatusAndDate(
                                LuggageStatusEnum.DELIVERED,
                                range.start(),
                                range.end())
        );

        cargoData.put(
                "Lost",
                range == null
                        ? luggageStatusRepository.countByStatus(LuggageStatusEnum.LOST)
                        : luggageStatusRepository.countByStatusAndDate(
                                LuggageStatusEnum.LOST,
                                range.start(),
                                range.end())
        );

        cargoData.put(
                "Pending",
                range == null
                        ? luggageStatusRepository.countByStatus(LuggageStatusEnum.PENDING)
                        : luggageStatusRepository.countByStatusAndDate(
                                LuggageStatusEnum.PENDING,
                                range.start(),
                                range.end())
        );

        return cargoData;
    }

    public Map<String, Long> getCustomerRegistrationTrends(String month) {
        DateRange range = resolveRange(month);
        ZonedDateTime end = range == null ? ZonedDateTime.now() : range.end();
        ZonedDateTime start = range == null ? end.minusMonths(6) : range.start();

        List<Object[]> trendsData = customerRepository.getMonthlyCustomerRegistrationTrends(start, end);
        Map<String, Long> monthlyTrends = new LinkedHashMap<>();
        for (Object[] row : trendsData) {
            String monthKey = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            monthlyTrends.put(monthKey, count);
        }
        return monthlyTrends;
    }

    private DateRange resolveRange(String month) {
        if (month == null || month.isEmpty() || "all".equalsIgnoreCase(month)) {
            return null;
        }
        ZonedDateTime endDate = ZonedDateTime.now();
        try {
            double parsed = Double.parseDouble(month);
            ZonedDateTime startDate = parsed < 1 ? endDate.minusWeeks(1) : endDate.minusMonths((int) parsed);
            return new DateRange(startDate, endDate);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid month value: " + month, ex);
        }
    }

    private record DateRange(ZonedDateTime start, ZonedDateTime end) {}
}
