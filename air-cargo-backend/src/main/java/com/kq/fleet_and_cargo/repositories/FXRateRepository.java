package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.FXRates;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface FXRateRepository extends JpaRepository<FXRates, String> {

    @Query("SELECT f FROM FXRates f WHERE " +
            "LOWER(f.sourceCurrency) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.destinationCurrency) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<FXRates> findAllBySourceCurrencyContainingOrDestinationCurrencyContaining(@Param("search") String formattedSearch, Pageable pageable);

    @Query(
            """
                    SELECT fx from FXRates fx where
                    upper(fx.destinationCurrency) like concat('%', upper(:currencyCode), '%')
                    """
    )
    Optional<FXRates> findByCurrencyCode(@Param("currencyCode") String currencyCode);

    @Query("""
            select distinct fx.sourceCurrency from FXRates fx
            """)
    Set<String> findAllSourceCurrencies();

    @Query("""
            select distinct fx.destinationCurrency from FXRates fx
            """)
    Set<String> findAllDestinationCurrencies();
}
