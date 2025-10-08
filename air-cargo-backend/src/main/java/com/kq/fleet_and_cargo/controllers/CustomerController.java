package com.kq.fleet_and_cargo.controllers;

import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.payload.request.CustomerUpdateRequest;
import com.kq.fleet_and_cargo.payload.response.CustomerNoCargoResponse;
import com.kq.fleet_and_cargo.services.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public record CustomerController(CustomerService customerService) {
    @GetMapping
    public ResponseEntity<Page<CustomerNoCargoResponse>> getCustomers(@RequestParam int page, @RequestParam int size, @RequestParam(required = false, defaultValue = "") String search, @RequestParam(required = false, defaultValue = "createdAt") String sortBy, @RequestParam(required = false, defaultValue = "asc") String order, @RequestParam(required = false, defaultValue = "") String startDate, @RequestParam(required = false, defaultValue = "") String endDate) {
        return ResponseEntity.ok(customerService.findAll(search, page, size, sortBy, order, startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String id) {
        return ResponseEntity.ok(customerService.findById(id));
    }
   @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable("phone") String phone) {
        return ResponseEntity.ok(customerService.findByPhone(phone));
    }
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.create(customer));
    }

    @PutMapping
    public ResponseEntity<Customer> updateCustomer(@RequestBody CustomerUpdateRequest customerUpdateRequest) {
        return ResponseEntity.ok(customerService.update(customerUpdateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable String id) {
        String deleted = customerService.delete(id);
        return ResponseEntity.ok(deleted);
    }
}
