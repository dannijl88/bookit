package com.dani.bookit.repositories;

import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClient(User client);

}
