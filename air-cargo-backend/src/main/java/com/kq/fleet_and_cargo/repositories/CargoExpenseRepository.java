package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.CargoExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CargoExpenseRepository extends JpaRepository<CargoExpense, String> {
    List<CargoExpense> findByCargoIdOrderByIncurredAtDesc(String cargoId);
}
