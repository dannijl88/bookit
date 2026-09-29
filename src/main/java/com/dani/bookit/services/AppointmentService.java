package com.dani.bookit.services;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.dto.UpdateStatusDto;
import com.dani.bookit.entities.*;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.exceptions.ScheduleOverlapException;
import com.dani.bookit.mappers.AppointmentMapper;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import com.dani.bookit.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repository;
    private final UserRepository userRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final EmployeeRepository employeeRepository;
    private final AvailabilityService availabilityService;

    public AppointmentResponseDto create(AppointmentRequestDto dto, Long userId){

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id:" + userId));
        ServiceOffering serviceOffering = serviceOfferingRepository.findById(dto.getServiceId()).orElseThrow(() ->
                new ResourceNotFoundException("Service offering not found with id:" + dto.getServiceId()));
        Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id:" + dto.getEmployeeId()));
        List<LocalTime> availableSlots = availabilityService.getAvailableSlots(dto.getEmployeeId(), dto.getServiceId(), dto.getAppointmentDateTime().toLocalDate());
        if(!availableSlots.contains(dto.getAppointmentDateTime().toLocalTime())){
            throw new ScheduleOverlapException("Slot not available");
        }
        Appointment newAppointment = AppointmentMapper.toEntity(dto, serviceOffering, employee, user);
        newAppointment.setStatus(Status.PENDING);
        repository.save(newAppointment);
        return AppointmentMapper.toDto(newAppointment);

    }

    public AppointmentResponseDto updateStatus(Long appointmentId, UpdateStatusDto dto, Long userId){

        Appointment appointment = repository.findById(appointmentId).orElseThrow(() ->
                new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        if (!appointment.getEmployee().getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        appointment.setStatus(dto.getStatus());
        repository.save(appointment);
        return AppointmentMapper.toDto(appointment);

    }

    @Cacheable(value = "appointments", key = "#appointment + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<AppointmentResponseDto> findByClient(Long userId, Pageable pageable){
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return repository.findByClient(user, pageable).map(AppointmentMapper::toDto);
    }

}
