package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    @Query("SELECT c FROM Customer c " +
            "WHERE (LOWER(c.firstName) LIKE LOWER(concat('%', :search, '%')) " +
            "OR c.id LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(concat('%', :search, '%'))) "+
            "OR LOWER(c.email) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.phoneNumber) LIKE LOWER(concat('%', :search, '%'))")
    Page<Customer> findAll(@Param("search") String search, Pageable pageable);
    @Query("SELECT c FROM Customer c " +
            "WHERE c.createdAt BETWEEN :start AND :end AND (" +

            "LOWER(c.firstName) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.id) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(concat(c.firstName, ' ', c.lastName)) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.email) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.phoneNumber) LIKE LOWER(concat('%', :search, '%'))) ")
    List<Customer> findAllByDateWithNoPaging(@Param("search") String search, @Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);
    @Query("SELECT c FROM Customer c " +
            "WHERE c.createdAt BETWEEN :start AND :end AND (" +
            "LOWER(c.firstName) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.id) LIKE LOWER(concat('%', :search, '%')) " +

            "OR LOWER(concat(c.firstName, ' ', c.lastName)) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.email) LIKE LOWER(concat('%', :search, '%')) " +
            "OR LOWER(c.phoneNumber) LIKE LOWER(concat('%', :search, '%'))) ")
    Page<Customer> findAllByDate(@Param("search") String search, @Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end, Pageable pageable);
    Optional<Customer> findByPhoneNumber(String phone);
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    Long countWithDate(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);
    @Query("SELECT CONCAT(YEAR(c.createdAt), '-', MONTH(c.createdAt)) as month, COUNT(c) " +
            "FROM Customer c " +
            "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY YEAR(c.createdAt), MONTH(c.createdAt) " +
            "ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)")
    List<Object[]> getMonthlyCustomerRegistrationTrends(@Param("startDate") ZonedDateTime startDate,
                                                        @Param("endDate") ZonedDateTime endDate);

}
