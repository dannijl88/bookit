package com.dani.bookit.services;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.dto.UpdateStatusDto;
import com.dani.bookit.entities.*;
import com.dani.bookit.events.EmailNotificationEvent;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.exceptions.ScheduleOverlapException;
import com.dani.bookit.mappers.AppointmentMapper;
import com.dani.bookit.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final BusinessRepository businessRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @CacheEvict(value = "appointments", allEntries = true)
    public AppointmentResponseDto create(AppointmentRequestDto dto, Long userId){

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id:" + userId));
        ServiceOffering serviceOffering = serviceOfferingRepository.findById(dto.getServiceId()).orElseThrow(() ->
                new ResourceNotFoundException("Service offering not found with id:" + dto.getServiceId()));
        Employee employee = employeeRepository.findByIdForUpdate(dto.getEmployeeId()).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id:" + dto.getEmployeeId()));
        List<LocalTime> availableSlots = availabilityService.getAvailableSlots(dto.getEmployeeId(), dto.getServiceId(), dto.getAppointmentDateTime().toLocalDate());
        if(!availableSlots.contains(dto.getAppointmentDateTime().toLocalTime())){
            throw new ScheduleOverlapException("Slot not available");
        }
        Appointment newAppointment = AppointmentMapper.toEntity(dto, serviceOffering, employee, user);
        newAppointment.setStatus(Status.PENDING);
        repository.save(newAppointment);
        publishAppointmentEmail(user.getEmail(), "Cita creada", "Tu cita ha sido creada para el " + dto.getAppointmentDateTime());
        return AppointmentMapper.toDto(newAppointment);

    }

    @Transactional
    @CacheEvict(value = "appointments", allEntries = true)
    public AppointmentResponseDto updateStatus(Long appointmentId, UpdateStatusDto dto, Long userId){
        Appointment appointment = repository.findById(appointmentId).orElseThrow(() ->
                new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        if (!appointment.getEmployee().getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        appointment.setStatus(dto.getStatus());
        repository.save(appointment);
        publishAppointmentEmail(appointment.getClient().getEmail(), "Estado de la cita actualizado", "Tu cita ha sido " + dto.getStatus());
        return AppointmentMapper.toDto(appointment);

    }

    @Transactional(readOnly = true)
    @Cacheable(value = "appointments", key = "#userId + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<AppointmentResponseDto> findByClient(Long userId, Pageable pageable){
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return repository.findByClient(user, pageable).map(AppointmentMapper::toDto);
    }

    @Transactional
    @CacheEvict(value = "appointments", allEntries = true)
    public AppointmentResponseDto cancel(Long appointmentId, Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id:" + userId));
        Appointment appointment = repository.findById(appointmentId).orElseThrow(() ->
                new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        if(!appointment.getClient().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        appointment.setStatus(Status.CANCELLED);
        repository.save(appointment);
        publishAppointmentEmail(user.getEmail(), "Cita cancelada", "Tu cita con fecha " + appointment.getAppointmentDatetime() + " ha sido cancelada");
        return AppointmentMapper.toDto(appointment);

    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> findByBusiness(Long businessId, Long userId, Pageable pageable){
        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id: " + businessId));
        if(!business.getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }

        return repository.findByEmployee_Business(business, pageable).map(AppointmentMapper::toDto);
    }

    private void publishAppointmentEmail(String to, String subject, String body){
        eventPublisher.publishEvent(new EmailNotificationEvent(to, subject, body));
    }

}
