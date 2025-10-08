package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.payload.request.AuthRequest;
import com.kq.fleet_and_cargo.payload.request.ChangePasswordRequest;
import com.kq.fleet_and_cargo.payload.request.ForgetPasswordRequest;
import com.kq.fleet_and_cargo.payload.request.RegistrationRequest;
import com.kq.fleet_and_cargo.payload.response.AuthResponse;
import com.kq.fleet_and_cargo.payload.response.OtpResponse;
import com.kq.fleet_and_cargo.payload.response.RegistrationResponse;
import com.kq.fleet_and_cargo.services.AuthService;
import com.kq.fleet_and_cargo.services.OtpService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
public record AuthenticationController(AuthService authService, OtpService otpService, ModelMapper mapper) {

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(authService.AuthenticateUser(authRequest));
    }

    @PostMapping("/toggle/{id}")
    public ResponseEntity<String> toggleUser(@PathVariable("id") String id) {
        return ResponseEntity.ok(authService.toggleUser(id));
    }

    @GetMapping("/{email}")
    public ResponseEntity<AuthResponse> getUser(@PathVariable("email") String email) {
        return ResponseEntity.ok(mapper.map(authService.getUser(email), AuthResponse.class));
    }

    @PostMapping("/update")
    public ResponseEntity<RegistrationResponse> updateUser(@RequestBody RegistrationRequest registrationRequest) {
        return ResponseEntity.ok(authService.updateUser(registrationRequest));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(authService.changePassword(changePasswordRequest));
    }

    @PostMapping("/forgot-password/{email}")
    public ResponseEntity<String> forgetPassword(@PathVariable("email") String email) {
        log.info("Email: {}", email);
        return ResponseEntity.ok(authService.forgetPassword(email));
    }

    @PostMapping("/change-password/{email}")
    public ResponseEntity<String> forgetChangePassword(
            @PathVariable("email") String email,
            @RequestBody ForgetPasswordRequest forgetPasswordRequest
    ) {
        return ResponseEntity.ok(authService.forgetChangePassword(email, forgetPasswordRequest));
    }

    @PostMapping("/otp-valid/{email}/{otp}")
    public ResponseEntity<OtpResponse> isOtpValid(
            @PathVariable("otp") String otp,
            @PathVariable("email") String email
    ) {
        return ResponseEntity.ok(otpService.isOtpValid(email, otp));
    }

    @PostMapping("/{id}/curr/{preferred}")
    public ResponseEntity<String> changeCurrency(
            @PathVariable("id") String id,
            @PathVariable("preferred") String preferred
    ) {
        return ResponseEntity.ok(authService.changePreferredCurrencyOfUser(id, preferred));
    }
}
