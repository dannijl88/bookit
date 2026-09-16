package com.dani.bookit.services;

import com.dani.bookit.dto.EmployeeRequestDto;
import com.dani.bookit.dto.EmployeeResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.EmployeeMapper;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final BusinessRepository businessRepository;

    public EmployeeResponseDto create(EmployeeRequestDto employeeRequestDto, Long businessId, Long userId){
        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id:" + businessId));
        if(!business.getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("No tienes permiso");
        }
        Employee newEmployee = EmployeeMapper.toEntity(employeeRequestDto, business);
        repository.save(newEmployee);
        return EmployeeMapper.toEmployeeResponse(newEmployee);
    }

}
