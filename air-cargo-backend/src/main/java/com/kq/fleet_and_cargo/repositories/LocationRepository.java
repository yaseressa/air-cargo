package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {
}
