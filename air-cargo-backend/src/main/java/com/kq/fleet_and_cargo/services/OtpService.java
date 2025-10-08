package com.kq.fleet_and_cargo.services;


import com.kq.fleet_and_cargo.amqp.RabbitConfiguration;
import com.kq.fleet_and_cargo.amqp.RabbitMqProducer;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.OTP;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.response.OtpResponse;
import com.kq.fleet_and_cargo.repositories.OTPRepository;
import com.kq.fleet_and_cargo.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Slf4j
public record OtpService(OTPRepository otpRepository, JWTAuthService jwtAuthService, UserRepository userRepository, RabbitConfiguration rabbitConfiguration, RabbitMqProducer rabbitMqProducer) {

    public String generateOtp(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isEmpty()){
            throw new NotFoundException("User not found");
        }
        Optional<OTP> otpFound = otpRepository.findByEmail(email);
        otpFound.ifPresent(otpRepository::delete);
        Random random = new Random();
        String otp = String.valueOf( random.nextInt(100000, 999999));
        while(otpRepository.findByOtp(otp).isPresent()){
            otp = String.valueOf( random.nextInt(100000, 999999));
        }

        ZonedDateTime expiryTime = ZonedDateTime.now().plusMinutes(3);
        OTP saved = otpRepository.save(OTP.builder().otp(otp).expiryTime(expiryTime).email(email).build());
        rabbitMqProducer.sendOTP(user.get().getEmail(), saved.getOtp(), rabbitConfiguration.otpEmailBinding().getRoutingKey(), rabbitConfiguration.otpEmailBinding().getExchange());

        return saved.getOtp();
    }

    public OtpResponse isOtpValid(String email, String otp) {
        OTP authenticated = otpRepository.findByEmail(email).get();
        ZonedDateTime expiryTime = authenticated.getExpiryTime();
        if (expiryTime.isAfter(ZonedDateTime.now()) && authenticated.getOtp().equals(otp)) {

            return OtpResponse.builder().isOtpValid(true).build();
        }
        return OtpResponse.builder().isOtpValid(false).build();
    }

    @Scheduled(fixedRate = 86_400_000)
    public void removeExpiredOtps() {
        otpRepository.deleteAll(otpRepository.findAll().stream()
                .filter(entry -> ZonedDateTime.now().isAfter(entry.getExpiryTime()))
                .collect(Collectors.toList()));
    }
}