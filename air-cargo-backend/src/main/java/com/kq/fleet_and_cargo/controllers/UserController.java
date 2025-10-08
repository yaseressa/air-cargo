package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.models.User;
import com.kq.fleet_and_cargo.payload.request.UserUpdateRequest;
import com.kq.fleet_and_cargo.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public record UserController(UserService userService, ModelMapper mapper) {
    @GetMapping
    public ResponseEntity<Page<UserUpdateRequest>> getUsers(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam(required = false, defaultValue = "") String search,
                                                            @RequestParam(required = false, defaultValue = "") String userRole) {
        return ResponseEntity.ok(userService.findAll(page, size, search, userRole).map(user -> mapper.map(user, UserUpdateRequest.class)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserUpdateRequest> getUser(@RequestParam String id) {
        return ResponseEntity.ok(mapper.map(userService.findById(id), UserUpdateRequest.class));
    }
    @PostMapping
    public ResponseEntity<UserUpdateRequest> createUser(@RequestBody User user) {
        return ResponseEntity.ok(mapper.map(userService.create(user), UserUpdateRequest.class));
    }

    @PutMapping
    public ResponseEntity<UserUpdateRequest> updateUser(@RequestBody UserUpdateRequest userUpdateRequest) {
        return ResponseEntity.ok(mapper.map(userService.update(userUpdateRequest), UserUpdateRequest.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.delete(id));
    }
}
