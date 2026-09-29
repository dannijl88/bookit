package com.dani.bookit.repositories;

import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClient(User client);
    List<Appointment> findByEmployeeAndAppointmentDatetimeBetween(Employee employee, LocalDateTime start, LocalDateTime end);
    Page<Appointment> findByClient(User client, Pageable pageable);
    Page<Appointment> findByEmployee_Business(Business business, Pageable pageable);

}
