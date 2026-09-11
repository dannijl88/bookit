package com.dani.bookit.mappers;

import com.dani.bookit.dto.EmployeeRequestDto;
import com.dani.bookit.dto.EmployeeResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;

public class EmployeeMapper {

    public static Employee toEntity(EmployeeRequestDto dto, Business business){
        Employee employee = new Employee();
        employee.setName(dto.getName());
        employee.setBusiness(business);
        return employee;
    }

    public static EmployeeResponseDto toEmployeeResponse(Employee employee){
        EmployeeResponseDto dto = new EmployeeResponseDto();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setBusinessId(employee.getBusiness().getId());
        dto.setBusinessName(employee.getBusiness().getName());
        return dto;
    }

}
