package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import com.kq.fleet_and_cargo.models.LuggageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface LuggageStatusRepository extends JpaRepository<LuggageStatus, String>{
    @Query("SELECT COUNT(ls) FROM LuggageStatus ls WHERE ls.status = :luggageStatus")
    Long countByStatus(@Param("luggageStatus") LuggageStatusEnum luggageStatusEnum);
    @Query("SELECT COUNT(ls) FROM LuggageStatus ls WHERE ls.status = :luggageStatus AND ls.createdAt BETWEEN :startDate AND :endDate")
    Long countByStatusAndDate(@Param("luggageStatus") LuggageStatusEnum luggageStatusEnum, @Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);
    @Query("""
            SELECT ls.trackingHistory.cargo.id AS cargoId,
                   ls.status AS status,
                   ls.trackingHistory.location AS location
            FROM LuggageStatus ls
            WHERE ls.trackingHistory.cargo.id IN :cargoIds
              AND ls.createdAt = (
                  SELECT MAX(lsInner.createdAt)
                  FROM LuggageStatus lsInner
                  WHERE lsInner.trackingHistory.cargo.id = ls.trackingHistory.cargo.id
              )
            """)
    List<CargoStorageSnapshot> findLatestStatusByCargoIds(@Param("cargoIds") List<String> cargoIds);

    interface CargoStorageSnapshot {
        String getCargoId();
        LuggageStatusEnum getStatus();
        String getLocation();
    }
}
