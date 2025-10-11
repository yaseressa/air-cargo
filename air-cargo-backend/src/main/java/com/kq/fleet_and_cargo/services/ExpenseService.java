package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.Expense;
import com.kq.fleet_and_cargo.models.File;
import com.kq.fleet_and_cargo.models.Money;
import com.kq.fleet_and_cargo.payload.request.ExpenseRequest;
import com.kq.fleet_and_cargo.repositories.ExpenseRepository;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final FileService fileService;

    @Transactional(readOnly = true)
    public List<Expense> list() {
        List<Expense> expenses = expenseRepository.findAllByOrderByIncurredAtDesc();
        expenses.forEach(this::populateReceiptUrl);
        return expenses;
    }

    @Transactional
    public Expense create(ExpenseRequest request, MultipartFile receipt) throws IOException {
        Expense expense = new Expense();
        applyRequest(expense, request);

        if (receipt != null && !receipt.isEmpty()) {
            replaceReceipt(expense, receipt);
        }

        Expense saved = expenseRepository.save(expense);
        populateReceiptUrl(saved);
        return saved;
    }

    @Transactional
    public Expense update(String expenseId, ExpenseRequest request, MultipartFile receipt) throws IOException {
        if (!hasText(expenseId)) {
            throw new IllegalArgumentException("Expense id must be provided");
        }
        Expense existing = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));

        applyRequest(existing, request);

        if (receipt != null && !receipt.isEmpty()) {
            replaceReceipt(existing, receipt);
        }

        Expense saved = expenseRepository.save(existing);
        populateReceiptUrl(saved);
        return saved;
    }

    @Transactional
    public void delete(String expenseId) {
        if (!hasText(expenseId)) {
            throw new IllegalArgumentException("Expense id must be provided");
        }

        Expense existing = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));

        if (existing.getReceipt() != null) {
            fileService.deleteFile(existing.getReceipt().getId());
        }

        expenseRepository.delete(existing);
    }

    private void applyRequest(Expense expense, ExpenseRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Expense data must be provided");
        }
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        if (!hasText(request.currencyCode())) {
            throw new IllegalArgumentException("Currency must be provided");
        }

        Money money = new Money(request.amount(), request.currencyCode());
        ZonedDateTime incurredAt = request.incurredAt() != null ? request.incurredAt() : ZonedDateTime.now();

        expense.setDescription(request.description());
        expense.setAmount(money);
        expense.setIncurredAt(incurredAt);
    }

    private void replaceReceipt(Expense expense, MultipartFile receipt) throws IOException {
        if (expense.getReceipt() != null) {
            fileService.deleteFile(expense.getReceipt().getId());
            expense.setReceipt(null);
        }
        File stored = fileService.saveFile(receipt);
        expense.setReceipt(stored);
    }

    private void populateReceiptUrl(Expense expense) {
        if (expense.getReceipt() != null) {
            expense.getReceipt().setFileUrl(fileService.buildPublicUrl(expense.getReceipt()));
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
