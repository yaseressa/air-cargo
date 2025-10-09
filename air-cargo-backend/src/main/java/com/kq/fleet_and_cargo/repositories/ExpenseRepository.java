package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findAllByOrderByIncurredAtDesc();
}
