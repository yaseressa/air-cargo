package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, String> {

    List<Expense> findAllByOrderByIncurredAtDesc();

    @Query("""
            SELECT e
            FROM Expense e
            WHERE (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND e.incurredAt BETWEEN :start AND :end
            ORDER BY e.incurredAt DESC
            """)
    List<Expense> findAllWithinRange(
            @Param("search") String search,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end
    );

    @Query("""
            SELECT e.amount.currencyCode, SUM(e.amount.amount), COUNT(e)
            FROM Expense e
            WHERE (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND e.incurredAt BETWEEN :start AND :end
            GROUP BY e.amount.currencyCode
            ORDER BY SUM(e.amount.amount) DESC
            """)
    List<Object[]> summarizeByCurrency(
            @Param("search") String search,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end
    );

    @Query("""
            SELECT FUNCTION('DATE_TRUNC', 'month', e.incurredAt), e.amount.currencyCode, SUM(e.amount.amount)
            FROM Expense e
            WHERE (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND e.incurredAt BETWEEN :start AND :end
            GROUP BY FUNCTION('DATE_TRUNC', 'month', e.incurredAt), e.amount.currencyCode
            ORDER BY FUNCTION('DATE_TRUNC', 'month', e.incurredAt)
            """)
    List<Object[]> summarizeByMonth(
            @Param("search") String search,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end
    );
}
