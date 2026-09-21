package com.dani.bookit.mappers;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;

public class EmployeeScheduleMapper {

    public static EmployeeSchedule toEntity(EmployeeScheduleRequestDto dto, Employee employee){

        EmployeeSchedule employeeSchedule = new EmployeeSchedule();
        employeeSchedule.setStartTime(dto.getStartTime());
        employeeSchedule.setEndTime(dto.getEndTime());
        employeeSchedule.setDayOfWeek(dto.getDayOfWeek());
        employeeSchedule.setEmployee(employee);
        return employeeSchedule;

    }

    public static EmployeeScheduleResponseDto toResponseDto(EmployeeSchedule employeeSchedule){

        EmployeeScheduleResponseDto dto = new EmployeeScheduleResponseDto();
        dto.setId(employeeSchedule.getId());
        dto.setStartTime(employeeSchedule.getStartTime());
        dto.setEndTime(employeeSchedule.getEndTime());
        dto.setDayOfWeek(employeeSchedule.getDayOfWeek());
        dto.setEmployeeId(employeeSchedule.getEmployee().getId());
        dto.setEmployeeName(employeeSchedule.getEmployee().getName());
        return dto;
    }

}
