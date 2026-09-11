package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    public List<Employee> findByBusiness(Business business);

}
