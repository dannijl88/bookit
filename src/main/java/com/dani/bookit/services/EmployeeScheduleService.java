package com.dani.bookit.services;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.EmployeeScheduleMapper;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeScheduleService {

    private final EmployeeScheduleRepository repository;
    private final EmployeeRepository employeeRepository;

    public EmployeeScheduleResponseDto create(EmployeeScheduleRequestDto dto, Long employeeId, Long userId){

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new
                ResourceNotFoundException("Employee not found with id: " + employeeId));

        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }

        EmployeeSchedule newSchedule = EmployeeScheduleMapper.toEntity(dto, employee);
        repository.save(newSchedule);

        return EmployeeScheduleMapper.toResponseDto(newSchedule);

    }

}
