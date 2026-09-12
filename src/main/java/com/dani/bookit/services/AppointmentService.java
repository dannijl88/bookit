package com.dani.bookit.services;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.ServiceOffering;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.AppointmentMapper;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import com.dani.bookit.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repository;
    private final UserRepository userRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final EmployeeRepository employeeRepository;

    public AppointmentResponseDto create(AppointmentRequestDto dto, Long userId){

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id:" + userId));
        ServiceOffering serviceOffering = serviceOfferingRepository.findById(dto.getServiceId()).orElseThrow(() ->
                new ResourceNotFoundException("Service offering not found with id:" + dto.getServiceId()));
        Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id:" + dto.getEmployeeId()));

        Appointment newAppointment = AppointmentMapper.toEntity(dto, serviceOffering, employee, user);
        repository.save(newAppointment);
        return AppointmentMapper.toDto(newAppointment);

    }

}
