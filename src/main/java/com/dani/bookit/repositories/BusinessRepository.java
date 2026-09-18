package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByOwner(User owner);
    List<Business> findByCategory(String category);
    Page<Business> findByCategoryIgnoreCase(String category, Pageable pageable);

}
