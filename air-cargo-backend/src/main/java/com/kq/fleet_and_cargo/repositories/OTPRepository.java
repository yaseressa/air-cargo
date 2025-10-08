package com.kq.fleet_and_cargo.repositories;


import com.kq.fleet_and_cargo.models.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, String> {
    Optional<OTP> findByOtp(String Otp);
    Optional<OTP> findByEmail(String email);
}
