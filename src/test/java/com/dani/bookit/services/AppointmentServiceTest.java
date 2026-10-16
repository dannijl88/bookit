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
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import com.dani.bookit.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository repository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceOfferingRepository serviceOfferingRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private AvailabilityService availabilityService;
    @Mock
    private BusinessRepository businessRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AppointmentService appointmentService;

    private static final LocalDateTime SLOT = LocalDateTime.now().plusDays(1)
            .withHour(10).withMinute(0).withSecond(0).withNano(0);

    @Test
    void create_savesPendingAppointment_whenSlotIsAvailable(){

        User client = user(10L, "Client", "client@mail.com");
        Business business = business(1L);
        Employee employee = employee(2L, "Ana", business);
        ServiceOffering serviceOffering = serviceOffering(3L, "Corte", business);
        AppointmentRequestDto dto = new AppointmentRequestDto(SLOT, 3L, 2L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(client));
        when(serviceOfferingRepository.findById(3L)).thenReturn(Optional.of(serviceOffering));
        when(employeeRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(employee));
        when(availabilityService.getAvailableSlots(2L, 3L, SLOT.toLocalDate())).thenReturn(List.of(SLOT.toLocalTime()));

        AppointmentResponseDto result = appointmentService.create(dto, 10L);

        assertThat(result.getStatus()).isEqualTo(Status.PENDING);
        verify(repository).save(any(Appointment.class));
        verify(eventPublisher).publishEvent(any(EmailNotificationEvent.class));

    }

    @Test
    void create_throws_whenSlotIsNotAvailable(){

        User client = user(10L, "Client", "client@mail.com");
        Business business = business(1L);
        Employee employee = employee(2L, "Ana", business);
        ServiceOffering serviceOffering = serviceOffering(3L, "Corte", business);
        AppointmentRequestDto dto = new AppointmentRequestDto(SLOT, 3L, 2L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(client));
        when(serviceOfferingRepository.findById(3L)).thenReturn(Optional.of(serviceOffering));
        when(employeeRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(employee));
        when(availabilityService.getAvailableSlots(2L, 3L, SLOT.toLocalDate())).thenReturn(List.of());

        assertThatThrownBy(() -> appointmentService.create(dto, 10L))
                .isInstanceOf(ScheduleOverlapException.class);

        verify(repository, never()).save(any());

    }

    @Test
    void create_throws_whenEmployeeIsInactive(){

        User client = user(10L, "Client", "client@mail.com");
        Business business = business(1L);
        Employee employee = employee(2L, "Ana", business);
        employee.setActive(false);
        ServiceOffering serviceOffering = serviceOffering(3L, "Corte", business);
        AppointmentRequestDto dto = new AppointmentRequestDto(SLOT, 3L, 2L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(client));
        when(serviceOfferingRepository.findById(3L)).thenReturn(Optional.of(serviceOffering));
        when(employeeRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> appointmentService.create(dto, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee is not active");

        verify(repository, never()).save(any());

    }

    @Test
    void updateStatus_changesStatus_whenTransitionIsAllowed(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        AppointmentResponseDto result = appointmentService.updateStatus(50L, new UpdateStatusDto(Status.CONFIRMED), 1L);

        assertThat(result.getStatus()).isEqualTo(Status.CONFIRMED);
        verify(repository).save(appointment);
        verify(eventPublisher).publishEvent(any(EmailNotificationEvent.class));

    }

    @Test
    void updateStatus_throws_whenTransitionIsNotAllowed(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.updateStatus(50L, new UpdateStatusDto(Status.COMPLETED), 1L))
                .isInstanceOf(InvalidAppointmentStatusException.class);

        verify(repository, never()).save(any());

    }

    @Test
    void updateStatus_throws_whenUserIsNotTheOwner(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.updateStatus(50L, new UpdateStatusDto(Status.CONFIRMED), 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

    }

    @Test
    void cancel_setsCancelled_whenClientOwnsAppointment(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(userRepository.findById(10L)).thenReturn(Optional.of(appointment.getClient()));
        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        AppointmentResponseDto result = appointmentService.cancel(50L, 10L);

        assertThat(result.getStatus()).isEqualTo(Status.CANCELLED);
        verify(repository).save(appointment);

    }

    @Test
    void cancel_throws_whenClientDoesNotOwnAppointment(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(userRepository.findById(999L)).thenReturn(Optional.of(user(999L, "Other", "other@mail.com")));
        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.cancel(50L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

        verify(repository, never()).save(any());

    }

    @Test
    void cancel_throws_whenAppointmentIsCompleted(){

        Appointment appointment = appointment(50L, Status.COMPLETED);

        when(userRepository.findById(10L)).thenReturn(Optional.of(appointment.getClient()));
        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.cancel(50L, 10L))
                .isInstanceOf(InvalidAppointmentStatusException.class);

        verify(repository, never()).save(any());

    }

    @Test
    void updateStatus_notifiesConfirmation_toTheClient(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        appointmentService.updateStatus(50L, new UpdateStatusDto(Status.CONFIRMED), 1L);

        EmailNotificationEvent event = capturedEmail();
        assertThat(event.to()).isEqualTo("client@mail.com");
        assertThat(event.subject()).isEqualTo("Cita confirmada");
        assertThat(event.body()).contains("ha sido confirmada");

    }

    @Test
    void updateStatus_notifiesCancellationByBusiness_toTheClient(){

        Appointment appointment = appointment(50L, Status.PENDING);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        appointmentService.updateStatus(50L, new UpdateStatusDto(Status.CANCELLED), 1L);

        EmailNotificationEvent event = capturedEmail();
        assertThat(event.to()).isEqualTo("client@mail.com");
        assertThat(event.subject()).isEqualTo("Cita cancelada");
        assertThat(event.body()).contains("cancelada por el negocio");

    }

    @Test
    void updateStatus_notifiesCompletion_toTheClient(){

        Appointment appointment = appointment(50L, Status.CONFIRMED);

        when(repository.findById(50L)).thenReturn(Optional.of(appointment));

        appointmentService.updateStatus(50L, new UpdateStatusDto(Status.COMPLETED), 1L);

        EmailNotificationEvent event = capturedEmail();
        assertThat(event.subject()).isEqualTo("Cita completada");
        assertThat(event.body()).contains("completada");

    }

    private EmailNotificationEvent capturedEmail(){
        ArgumentCaptor<EmailNotificationEvent> captor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        return captor.getValue();
    }

    private User user(Long id, String name, String email){
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        return user;
    }

    private Business business(Long id){
        Business business = new Business();
        business.setId(id);
        business.setName("Business " + id);
        User owner = user(1L, "Owner", "owner@mail.com");
        business.setOwner(owner);
        return business;
    }

    private Employee employee(Long id, String name, Business business){
        Employee employee = new Employee();
        employee.setId(id);
        employee.setName(name);
        employee.setBusiness(business);
        return employee;
    }

    private ServiceOffering serviceOffering(Long id, String name, Business business){
        ServiceOffering serviceOffering = new ServiceOffering();
        serviceOffering.setId(id);
        serviceOffering.setName(name);
        serviceOffering.setBusiness(business);
        serviceOffering.setDuration(60);
        return serviceOffering;
    }

    private Appointment appointment(Long id, Status status){
        Business business = business(1L);
        Employee employee = employee(2L, "Ana", business);
        User client = user(10L, "Client", "client@mail.com");
        ServiceOffering serviceOffering = serviceOffering(3L, "Corte", business);

        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setStatus(status);
        appointment.setEmployee(employee);
        appointment.setClient(client);
        appointment.setServiceOffering(serviceOffering);
        appointment.setAppointmentDatetime(SLOT);
        return appointment;
    }

}
