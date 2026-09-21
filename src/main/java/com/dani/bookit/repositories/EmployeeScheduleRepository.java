package com.dani.bookit.repositories;

import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface EmployeeScheduleRepository extends JpaRepository<EmployeeSchedule, Long> {

    List<EmployeeSchedule> findByEmployeeAndDayOfWeek(Employee employee, DayOfWeek dayOfWeek);

}
