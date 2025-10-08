package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.CargoExpense;
import com.kq.fleet_and_cargo.models.File;
import com.kq.fleet_and_cargo.models.Money;
import com.kq.fleet_and_cargo.payload.request.CargoExpenseRequest;
import com.kq.fleet_and_cargo.repositories.CargoExpenseRepository;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CargoExpenseService {

    private final CargoRepository cargoRepository;
    private final CargoExpenseRepository cargoExpenseRepository;
    private final FileService fileService;

    @Transactional(readOnly = true)
    public List<CargoExpense> list(String cargoId) {
        List<CargoExpense> expenses = cargoExpenseRepository.findByCargoIdOrderByIncurredAtDesc(cargoId);
        expenses.forEach(this::populateReceiptUrl);
        return expenses;
    }

    @Transactional
    public CargoExpense create(String cargoId, CargoExpenseRequest request, MultipartFile receipt) throws IOException {
        if (request == null) {
            throw new IllegalArgumentException("Expense data must be provided");
        }
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        if (!hasText(request.currencyCode())) {
            throw new IllegalArgumentException("Currency must be provided");
        }

        Cargo cargo = cargoRepository.findById(cargoId)
                .orElseThrow(() -> new NotFoundException("Cargo not found"));

        Money money = new Money(request.amount(), request.currencyCode());
        ZonedDateTime incurredAt = request.incurredAt() != null ? request.incurredAt() : ZonedDateTime.now();

        CargoExpense expense = CargoExpense.builder()
                .cargo(cargo)
                .description(request.description())
                .amount(money)
                .incurredAt(incurredAt)
                .build();

        if (receipt != null && !receipt.isEmpty()) {
            File stored = fileService.saveFile(receipt);
            expense.setReceipt(stored);
        }

        CargoExpense saved = cargoExpenseRepository.save(expense);
        populateReceiptUrl(saved);
        return saved;
    }

    private void populateReceiptUrl(CargoExpense expense) {
        if (expense.getReceipt() != null) {
            expense.getReceipt().setFileUrl(fileService.buildPublicUrl(expense.getReceipt()));
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
