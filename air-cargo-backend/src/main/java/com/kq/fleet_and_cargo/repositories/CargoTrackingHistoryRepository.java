package com.kq.fleet_and_cargo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kq.fleet_and_cargo.models.CargoTrackingHistory;

@Repository
public interface CargoTrackingHistoryRepository extends JpaRepository<CargoTrackingHistory, String> {


}
