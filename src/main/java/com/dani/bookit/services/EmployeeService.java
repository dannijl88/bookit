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

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final BusinessRepository businessRepository;

    public EmployeeResponseDto create(EmployeeRequestDto employeeRequestDto, Long businessId, Long userId){
        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id:" + businessId));
        if(!business.getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        Employee newEmployee = EmployeeMapper.toEntity(employeeRequestDto, business);
        repository.save(newEmployee);
        return EmployeeMapper.toEmployeeResponse(newEmployee);
    }

    public List<EmployeeResponseDto> findByBusiness(Long businessId){
        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id:" + businessId));
        return repository.findByBusinessAndActiveTrue(business).stream().map(EmployeeMapper::toEmployeeResponse).toList();
    }

    public EmployeeResponseDto update(Long employeeId, Long userId, EmployeeRequestDto dto){

        Employee employee = repository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));
        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        employee.setName(dto.getName());
        repository.save(employee);
        return EmployeeMapper.toEmployeeResponse(employee);
    }

    public EmployeeResponseDto activate(Long employeeId, Long userId){
        Employee employee = repository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));
        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        employee.setActive(true);
        repository.save(employee);
        return EmployeeMapper.toEmployeeResponse(employee);
    }

    public EmployeeResponseDto deactivate(Long employeeId, Long userId){
        Employee employee = repository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));
        if(!employee.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        employee.setActive(false);
        repository.save(employee);
        return EmployeeMapper.toEmployeeResponse(employee);
    }

}
