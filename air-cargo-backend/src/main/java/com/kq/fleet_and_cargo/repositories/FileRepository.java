package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface FileRepository extends JpaRepository<File, String> {

}
