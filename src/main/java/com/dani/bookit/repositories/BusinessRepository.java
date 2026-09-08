package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {
}
