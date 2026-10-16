package com.dani.bookit.repositories;

import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.TimeOff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TimeOffRepository extends JpaRepository<TimeOff, Long> {

    List<TimeOff> findByEmployee(Employee employee);

    List<TimeOff> findByEmployeeAndStartDatetimeLessThanAndEndDatetimeGreaterThan(
            Employee employee, LocalDateTime end, LocalDateTime start);

}
