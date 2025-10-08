package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.enums.UserRoles;
import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.request.UserUpdateRequest;
import com.kq.fleet_and_cargo.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public record UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    public Page<User> findAll(int page, int size, String search, String userRole) {
        log.info("Fetching all users");
        String formattedSearch = search.replaceFirst("^\\+|^0+", "").trim();

        Pageable pageable = PageRequest.of(page, size);
        if (userRole != null && !userRole.isEmpty()) {
        return userRepository.findAll(formattedSearch, UserRoles.valueOf(userRole.toUpperCase()), pageable);
        }
        return userRepository.findAll(formattedSearch, null, pageable);
    }

    public User findById(String id) {
        log.info("Fetching user with id: {}", id);
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User create( User user) {
        log.info("Creating user");
        user.setEnabled(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User update(UserUpdateRequest userUpdateRequest) {
        log.info("Updating user with id: {}", userUpdateRequest.getId());
        User existingUser = userRepository.findById(userUpdateRequest.getId()).orElseThrow(() -> new NotFoundException("User not found"));
        existingUser.setFirstName(userUpdateRequest.getFirstName());
        existingUser.setLastName(userUpdateRequest.getLastName());
        existingUser.setPhoneNumber(userUpdateRequest.getPhoneNumber());
        existingUser.setEmail(userUpdateRequest.getEmail());
        existingUser.setEnabled(userUpdateRequest.isEnabled());
        existingUser.setRoles(userUpdateRequest.getRoles());
        return userRepository.save(existingUser);
    }
    public String delete(String id) {
        log.info("Deleting user with id: {}", id);
        userRepository.deleteById(id);
        return "User deleted successfully";
    }
}