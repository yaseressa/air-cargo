package com.kq.fleet_and_cargo.configurations;

import com.kq.fleet_and_cargo.enums.Gender;
import com.kq.fleet_and_cargo.enums.UserRoles;
import com.kq.fleet_and_cargo.models.Admin;
import com.kq.fleet_and_cargo.models.Cargo;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.models.FXRates;
import com.kq.fleet_and_cargo.repositories.AdminRepository;
import com.kq.fleet_and_cargo.repositories.CargoRepository;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;
import com.kq.fleet_and_cargo.repositories.FXRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SeederConfiguration implements ApplicationRunner {
    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final CargoRepository cargoRepository;
    private final PasswordEncoder passwordEncoder;
    private final FXRateRepository fxRateRepository;

    @Override
    public void run(ApplicationArguments args) {
        Optional<Admin> optionalAdmin = adminRepository.findByEmail("admin@example.com");
        if (optionalAdmin.isPresent()) {
            return;
        }

        Admin admin = new Admin();
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setRoles(Set.of(UserRoles.ADMIN));
        admin.setEnabled(true);
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhoneNumber("+25263345621");
        adminRepository.save(admin);

        Customer sender = new Customer();
        sender.setEmail("sender@example.com");
        sender.setPhoneNumber("+252633426114");
        sender.setFirstName("Hodan");
        sender.setLastName("Ali");
        sender.setAddress("Mogadishu");
        sender.setGender(Gender.FEMALE);
        sender = customerRepository.save(sender);

        Customer receiver = Customer.builder()
                .firstName("Abdi")
                .lastName("Omer")
                .phoneNumber("+252617000001")
                .gender(Gender.MALE)
                .address("Hargeisa")
                .build();
        receiver = customerRepository.save(receiver);

        Cargo sampleCargo = Cargo.builder()
                .sender(sender)
                .receiver(receiver)
                .pickupLocation("Mogadishu")
                .destination("Hargeisa")
                .description("Sample electronics shipment")
                .cargoType("Electronics")
                .quantity(10)
                .weight(12.5)
                .createdAt(ZonedDateTime.now())
                .build();
        cargoRepository.save(sampleCargo);

        fxRateRepository.findByCurrencyCode("USD").orElseGet(() ->
                fxRateRepository.save(FXRates.builder()
                        .rate(1.0)
                        .destinationCurrency("USD")
                        .sourceCurrency("USD")
                        .build())
        );
    }
}
