package com.dani.bookit.repositories;

import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByAppointment(Appointment appointment);
    Page<Review> findByAppointment_Employee_Business(Business business, Pageable pageable);
}
