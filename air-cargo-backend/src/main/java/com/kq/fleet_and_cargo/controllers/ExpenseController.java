package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.models.Expense;
import com.kq.fleet_and_cargo.payload.request.ExpenseRequest;
import com.kq.fleet_and_cargo.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses() {
        return ResponseEntity.ok(expenseService.list());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Expense> createExpense(
            @RequestPart("expense") ExpenseRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        Expense expense = expenseService.create(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }
}
