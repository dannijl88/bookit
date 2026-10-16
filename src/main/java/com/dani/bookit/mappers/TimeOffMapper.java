package com.dani.bookit.mappers;

import com.dani.bookit.dto.TimeOffRequestDto;
import com.dani.bookit.dto.TimeOffResponseDto;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.TimeOff;

public class TimeOffMapper {

    public static TimeOff toEntity(TimeOffRequestDto dto, Employee employee){

        TimeOff timeOff = new TimeOff();
        timeOff.setStartDatetime(dto.getStartDatetime());
        timeOff.setEndDatetime(dto.getEndDatetime());
        timeOff.setReason(dto.getReason());
        timeOff.setEmployee(employee);
        return timeOff;

    }

    public static TimeOffResponseDto toResponseDto(TimeOff timeOff){

        TimeOffResponseDto dto = new TimeOffResponseDto();
        dto.setId(timeOff.getId());
        dto.setStartDatetime(timeOff.getStartDatetime());
        dto.setEndDatetime(timeOff.getEndDatetime());
        dto.setReason(timeOff.getReason());
        dto.setEmployeeId(timeOff.getEmployee().getId());
        dto.setEmployeeName(timeOff.getEmployee().getName());
        return dto;
    }

}
