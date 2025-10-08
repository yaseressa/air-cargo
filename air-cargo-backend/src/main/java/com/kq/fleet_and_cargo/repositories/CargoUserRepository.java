package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.CargoUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoUserRepository extends JpaRepository<CargoUser, String> {
}
