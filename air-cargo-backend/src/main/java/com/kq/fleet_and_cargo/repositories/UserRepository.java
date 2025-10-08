package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.enums.UserRoles;
import com.kq.fleet_and_cargo.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u FROM User u " +
            "WHERE (LOWER(u.firstName) LIKE LOWER(concat('%', :search, '%')) " +
            "   OR LOWER(u.lastName) LIKE LOWER(concat('%', :search, '%')) " +
            "   OR LOWER(u.email) LIKE LOWER(concat('%', :search, '%')) " +
            "   OR LOWER(u.id) LIKE LOWER(concat('%', :search, '%')) " +
            "   OR LOWER(u.phoneNumber) LIKE LOWER(concat('%', :search, '%'))) " +
            "   AND (:role IS NULL OR :role MEMBER OF u.roles)")
    Page<User> findAll(@Param("search") String search, @Param("role") UserRoles role, Pageable pageable);

    @Query("select u from User u where :role MEMBER OF u.roles")
    List<User> findAllByRole(@Param("role") UserRoles role);

    @Query("select u from User u where (u.email = :email or u.phoneNumber = :email)")
    Optional<User> findByEmail(@Param("email") String email);
}
