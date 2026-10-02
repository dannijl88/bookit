package com.dani.bookit.services;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.exceptions.ScheduleOverlapException;
import com.dani.bookit.mappers.EmployeeScheduleMapper;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

        List<EmployeeSchedule> schedules = repository.findByEmployeeAndDayOfWeek(employee, dto.getDayOfWeek());
        boolean overlaps = schedules.stream().anyMatch(schedule ->
                dto.getStartTime().isBefore(schedule.getEndTime()) && schedule.getStartTime().isBefore(dto.getEndTime()));
        if(overlaps){
            throw new ScheduleOverlapException("This schedule overlaps with existing schedule");
        }

        EmployeeSchedule newSchedule = EmployeeScheduleMapper.toEntity(dto, employee);
        repository.save(newSchedule);

        return EmployeeScheduleMapper.toResponseDto(newSchedule);

    }

    public List<EmployeeScheduleResponseDto> findByEmployee(Long employeeId){
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));
        return repository.findByEmployee(employee).stream()
                .map(EmployeeScheduleMapper::toResponseDto)
                .toList();
    }

    public EmployeeScheduleResponseDto update(Long scheduleId, EmployeeScheduleRequestDto dto, Long userId){
        EmployeeSchedule schedule = repository.findById(scheduleId).orElseThrow(() ->
                new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        if(!schedule.getEmployee().getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        repository.save(schedule);
        return EmployeeScheduleMapper.toResponseDto(schedule);
    }

    public void delete(Long scheduleId, Long userId){
        EmployeeSchedule schedule = repository.findById(scheduleId).orElseThrow(() ->
                new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        if(!schedule.getEmployee().getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        repository.delete(schedule);
    }

}
