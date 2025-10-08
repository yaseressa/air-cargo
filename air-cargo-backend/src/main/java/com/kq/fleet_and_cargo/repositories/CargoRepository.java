package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.CargoTrackingHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, String> {
        @Query("SELECT l FROM Cargo l " +
                        "WHERE (LOWER(l.sender.firstName) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(concat(l.sender.firstName, ' ', l.sender.lastName)) LIKE LOWER(concat('%', :search, '%')) "
                        +
                        "OR LOWER(l.sender.lastName) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.id) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.sender.email) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.sender.phoneNumber) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.destination) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.cargoType) LIKE LOWER(concat('%', :search, '%')) " +
                        "OR LOWER(l.pickupLocation) LIKE LOWER(concat('%', :search, '%'))) " +
                        "AND ((:pickupLocation IS NULL OR :pickupLocation = '') OR LOWER(l.pickupLocation) = LOWER(:pickupLocation)) "
                        +
                        "AND ((:destination IS NULL OR :destination = '') OR LOWER(l.destination) = LOWER(:destination))")
        Page<Cargo> findAll(@Param("search") String search,
                        @Param("pickupLocation") String pickupLocation,
                        @Param("destination") String destination,
                        Pageable pageable);

        @Query("SELECT l FROM Cargo l " +
                        "WHERE l.createdAt BETWEEN :startDate AND :endDate AND (" +
                        "LOWER(l.id) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.firstName) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.lastName) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(concat(l.sender.firstName, ' ', l.sender.lastName)) LIKE LOWER(concat('%', :search, '%')) OR "
                        +
                        "LOWER(l.sender.email) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.phoneNumber) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.destination) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.pickupLocation) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.cargoType) LIKE LOWER(concat('%', :search, '%'))) " +
                        "AND ((:pickupLocation IS NULL OR :pickupLocation = '') OR LOWER(l.pickupLocation) = LOWER(:pickupLocation)) "
                        +
                        "AND ((:destination IS NULL OR :destination = '') OR LOWER(l.destination) = LOWER(:destination))")
        Page<Cargo> findAllByDate(@Param("search") String search,
                        @Param("startDate") ZonedDateTime start,
                        @Param("endDate") ZonedDateTime end,
                        @Param("pickupLocation") String pickupLocation,
                        @Param("destination") String destination,
                        Pageable pageable);

        @Query("SELECT l FROM Cargo l " +
                        "WHERE l.createdAt BETWEEN :startDate AND :endDate AND (" +
                        "LOWER(l.id) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.firstName) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.lastName) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(concat(l.sender.firstName, ' ', l.sender.lastName)) LIKE LOWER(concat('%', :search, '%')) OR "
                        +
                        "LOWER(l.sender.email) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.sender.phoneNumber) LIKE LOWER(concat('%', :search, '%')) OR " +

                        "LOWER(l.destination) LIKE LOWER(concat('%', :search, '%')) OR " +
                        "LOWER(l.pickupLocation) LIKE LOWER(concat('%', :search, '%'))) ")
        List<Cargo> findAllByDateNoPaging(@Param("search") String search, @Param("startDate") ZonedDateTime start,
                        @Param("endDate") ZonedDateTime end);

        @Query("SELECT COUNT(t) FROM Cargo t WHERE t.createdAt BETWEEN :startDate AND :endDate")
        Long countWithDate(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);

        @Query("SELECT c.trackingHistory FROM Cargo c WHERE c.id = :id")
        Optional<Set<CargoTrackingHistory>> findByCargoId(String id);

        @Query("SELECT c.pickupLocation, SUM(c.price.amount) " +
                        "FROM Cargo c " +
                        "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
                        "GROUP BY c.pickupLocation " +
                        "ORDER BY SUM(c.price.amount) DESC")
        List<Object[]> findRevenueByPickupCity(@Param("startDate") ZonedDateTime start,
                        @Param("endDate") ZonedDateTime end);

}
