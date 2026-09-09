package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByOwner(User owner);
    List<Business> findByCategory(String category);

}
