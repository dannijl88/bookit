package com.dani.bookit.services;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.dto.UpdateStatusDto;
import com.dani.bookit.entities.*;
import com.dani.bookit.events.EmailNotificationEvent;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.InvalidAppointmentStatusException;
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
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    private static final Map<Status, Set<Status>> ALLOWED_TRANSITIONS = Map.of(
            Status.PENDING, EnumSet.of(Status.CONFIRMED, Status.CANCELLED),
            Status.CONFIRMED, EnumSet.of(Status.COMPLETED, Status.CANCELLED),
            Status.COMPLETED, EnumSet.noneOf(Status.class),
            Status.CANCELLED, EnumSet.noneOf(Status.class)
    );

    @Transactional
    @CacheEvict(value = "appointments", allEntries = true)
    public AppointmentResponseDto create(AppointmentRequestDto dto, Long userId){

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id:" + userId));
        ServiceOffering serviceOffering = serviceOfferingRepository.findById(dto.getServiceId()).orElseThrow(() ->
                new ResourceNotFoundException("Service offering not found with id:" + dto.getServiceId()));
        Employee employee = employeeRepository.findByIdForUpdate(dto.getEmployeeId()).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id:" + dto.getEmployeeId()));
        if(!Boolean.TRUE.equals(employee.getActive())){
            throw new ResourceNotFoundException("Employee is not active with id: " + dto.getEmployeeId());
        }
        if(!Boolean.TRUE.equals(serviceOffering.getActive())){
            throw new ResourceNotFoundException("Service offering is not active with id: " + dto.getServiceId());
        }
        if(!Boolean.TRUE.equals(employee.getBusiness().getActive())){
            throw new ResourceNotFoundException("Business is not active with id: " + employee.getBusiness().getId());
        }
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
        Status currentStatus = appointment.getStatus();
        if (currentStatus != dto.getStatus()
                && !ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(dto.getStatus())) {
            throw new InvalidAppointmentStatusException(
                    "Invalid status transition from " + currentStatus + " to " + dto.getStatus());
        }
        appointment.setStatus(dto.getStatus());
        repository.save(appointment);
        publishStatusEmail(appointment);
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
        if(appointment.getStatus() == Status.COMPLETED){
            throw new InvalidAppointmentStatusException("Completed appointments cannot be cancelled");
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

    private void publishStatusEmail(Appointment appointment){
        Status status = appointment.getStatus();
        String date = appointment.getAppointmentDatetime().toString();
        String subject;
        String body;
        switch (status) {
            case CONFIRMED -> {
                subject = "Cita confirmada";
                body = "Tu cita con fecha " + date + " ha sido confirmada.";
            }
            case CANCELLED -> {
                subject = "Cita cancelada";
                body = "Tu cita con fecha " + date + " ha sido cancelada por el negocio.";
            }
            case COMPLETED -> {
                subject = "Cita completada";
                body = "Tu cita con fecha " + date + " se ha marcado como completada. ¡Gracias!";
            }
            default -> {
                subject = "Estado de la cita actualizado";
                body = "Tu cita con fecha " + date + " tiene un nuevo estado: " + status + ".";
            }
        }
        publishAppointmentEmail(appointment.getClient().getEmail(), subject, body);
    }

}
