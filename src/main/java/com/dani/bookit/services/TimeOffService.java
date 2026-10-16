package com.dani.bookit.services;

import com.dani.bookit.dto.TimeOffRequestDto;
import com.dani.bookit.dto.TimeOffResponseDto;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.TimeOff;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.TimeOffMapper;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeOffService {

    private final TimeOffRepository timeOffRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public TimeOffResponseDto create(TimeOffRequestDto dto, Long employeeId, Long userId){

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }

        TimeOff timeOff = TimeOffMapper.toEntity(dto, employee);
        timeOffRepository.save(timeOff);

        return TimeOffMapper.toResponseDto(timeOff);
    }

    @Transactional(readOnly = true)
    public List<TimeOffResponseDto> findByEmployee(Long employeeId, Long userId){

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }

        return timeOffRepository.findByEmployee(employee).stream()
                .map(TimeOffMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public void delete(Long timeOffId, Long userId){

        TimeOff timeOff = timeOffRepository.findById(timeOffId).orElseThrow(() ->
                new ResourceNotFoundException("Time off not found with id: " + timeOffId));

        if(!timeOff.getEmployee().getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }

        timeOffRepository.delete(timeOff);
    }

}
