package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.exceptions.ConflictException;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.request.AuthRequest;
import com.kq.fleet_and_cargo.payload.request.ChangePasswordRequest;
import com.kq.fleet_and_cargo.payload.request.ForgetPasswordRequest;
import com.kq.fleet_and_cargo.payload.request.RegistrationRequest;
import com.kq.fleet_and_cargo.payload.response.AuthResponse;
import com.kq.fleet_and_cargo.payload.response.OtpResponse;
import com.kq.fleet_and_cargo.payload.response.RegistrationResponse;
import com.kq.fleet_and_cargo.repositories.AdminRepository;
import com.kq.fleet_and_cargo.repositories.CargoUserRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
import com.kq.fleet_and_cargo.repositories.UserRepository;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Currency;

@Service
@Builder
@Slf4j
public record AuthService(UserRepository userRepository,
                          CargoUserRepository cargoUserRepository,
                          AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          ModelMapper mapper,
                          CustomerRepository customerRepository,
                          JWTAuthService jwtAuthService,
                          UserDetailsService userDetailsService,
                          OtpService otpService) {

    public AuthResponse AuthenticateUser(AuthRequest request) {
        User user = getUser(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtAuthService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .preferredCurrencyCode(user.getPreferredCurrencyCode())
                .phoneNumber(user.getPhoneNumber())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .id(user.getId())
                .build();
    }

    public String toggleUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return String.format("User %s is now %s", user.getEmail(), user.isEnabled() ? "Enabled" : "Disabled");
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public RegistrationResponse updateUser(RegistrationRequest registrationRequest) {
        User user = getUser(registrationRequest.getEmail());
        if (!passwordEncoder.matches(registrationRequest.getPassword(), user.getPassword())) {
            throw new ConflictException("Password is incorrect");
        }
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setPhoneNumber(registrationRequest.getPhoneNumber());
        user.setEmail(registrationRequest.getEmail());

        userRepository.save(user);
        return mapper.map(user, RegistrationResponse.class);
    }

    public String changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = getUser(changePasswordRequest.getEmail());
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new ConflictException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully";
    }

    public String forgetPassword(String email) {
        return otpService.generateOtp(email);
    }

    public String forgetChangePassword(String email, ForgetPasswordRequest forgetPasswordRequest) {
        OtpResponse otpValid = otpService.isOtpValid(email, forgetPasswordRequest.getOtp());
        if (!otpValid.isOtpValid()) {
            throw new ConflictException("Invalid OTP");
        }
        User user = getUser(email);
        user.setPassword(passwordEncoder.encode(forgetPasswordRequest.getPassword()));
        userRepository.save(user);
        return "Password changed successfully";
    }

    public String changePreferredCurrencyOfUser(String userId, String preferredCurrency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        try {
            String currencyCode;
            if (!"SLSH".equals(preferredCurrency)) {
                currencyCode = Currency.getInstance(preferredCurrency).getCurrencyCode();
            } else {
                currencyCode = "SLSH";
            }
            user.setPreferredCurrencyCode(currencyCode);
            userRepository.save(user);
            return "Currency set to " + currencyCode;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid currency code: " + preferredCurrency);
        }
    }
}

