package com.kq.fleet_and_cargo.services;

import java.time.ZonedDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.kq.fleet_and_cargo.exceptions.NotFoundException;
import com.kq.fleet_and_cargo.models.Customer;
import com.kq.fleet_and_cargo.payload.request.CustomerUpdateRequest;
import com.kq.fleet_and_cargo.payload.response.CustomerNoCargoResponse;
import com.kq.fleet_and_cargo.repositories.CustomerRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public record CustomerService(CustomerRepository customerRepository, ModelMapper modelMapper) {
    public Page<CustomerNoCargoResponse> findAll(String search, int page, int size, String sortBy, String order, String startDate, String endDate) {
        log.info("Fetching all customers");
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        String formattedSearch = search.replaceFirst("^\\+|^0+", "").trim();
        Pageable pageable = PageRequest.of(page, size, sort);
        if(!startDate.isBlank() && !endDate.isBlank()){
            ZonedDateTime start = ZonedDateTime.parse(startDate);
            ZonedDateTime end = ZonedDateTime.parse(endDate);
            return customerRepository.findAllByDate(formattedSearch, start, end,  pageable).map(c -> modelMapper.map(c, CustomerNoCargoResponse.class));
        }

        return customerRepository.findAll(formattedSearch, pageable).map(c -> modelMapper.map(c, CustomerNoCargoResponse.class));
    }


    public Customer findById(String id) {
        log.info("Fetching customer with id: {}", id);
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer not found"));
        log.info("Customer found: {}", customer);
        return customer;
    }
    public Customer create(Customer customer) {
        log.info("Creating customer");
        return customerRepository.save(customer);
    }
    public Customer update(CustomerUpdateRequest customerUpdateRequest) {
        Customer existingCustomer = customerRepository.findById(customerUpdateRequest.getId()).orElseThrow(() -> new NotFoundException("Customer not found"));
        existingCustomer.setFirstName(customerUpdateRequest.getFirstName());
        existingCustomer.setLastName(customerUpdateRequest.getLastName());
        existingCustomer.setPhoneNumber(customerUpdateRequest.getPhoneNumber());
        existingCustomer.setGender(customerUpdateRequest.getGender());
        existingCustomer.setEmail(customerUpdateRequest.getEmail());
        existingCustomer.setAddress(customerUpdateRequest.getAddress());
        return customerRepository.save(existingCustomer);
    }
    public String delete(String id) {
        log.info("Deleting customer with id: {}", id);
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer not found"));
        customerRepository.delete(customer);
        return "Customer deleted successfully";
    }

    public Customer findByPhone(String phone) {
        log.info("Fetching customer with phone: {}", phone);
        return customerRepository.findByPhoneNumber(phone).orElseThrow(() -> new NotFoundException("Customer not found"));
    }

}
