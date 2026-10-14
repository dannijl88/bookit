package com.dani.bookit.services;

import com.dani.bookit.entities.*;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AvailabilityServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ServiceOfferingRepository serviceOfferingRepository;
    @Mock
    private EmployeeScheduleRepository employeeScheduleRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    @Test
    void returnAllSlots_whenNoAppointments(){


        EmployeeSchedule employeeSchedule = schedule(9, 14);
        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));
        when(employeeScheduleRepository.findByEmployeeAndDayOfWeek(employee, date.getDayOfWeek())).thenReturn(List.of(employeeSchedule));
        when(appointmentRepository.findByEmployeeAndAppointmentDatetimeBetween(any(), any(),any())).thenReturn(List.of());

        List<LocalTime> slots = availabilityService.getAvailableSlots(1L, 1L, date);

        assertThat(slots).containsExactly(
                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                LocalTime.of(12, 0), LocalTime.of(13, 0));

    }

    @Test
    void excludesSlot_whenAppointmentOverlaps(){

        EmployeeSchedule employeeSchedule = schedule(9, 14);
        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);
        Appointment appointment = appointment(date.atTime(11, 0), Status.PENDING, serviceOffering);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));
        when(employeeScheduleRepository.findByEmployeeAndDayOfWeek(employee, date.getDayOfWeek())).thenReturn(List.of(employeeSchedule));
        when(appointmentRepository.findByEmployeeAndAppointmentDatetimeBetween(any(), any(),any())).thenReturn(List.of(appointment));

        List<LocalTime> slots = availabilityService.getAvailableSlots(1L, 1L, date);

        assertThat(slots).containsExactly(
                LocalTime.of(9, 0), LocalTime.of(10, 0),
                LocalTime.of(12, 0), LocalTime.of(13, 0));

    }

    @Test
    void includesSlot_whenAppointmentIsCancelled(){

        EmployeeSchedule employeeSchedule = schedule(9, 14);
        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);
        Appointment appointment = appointment(date.atTime(11, 0), Status.CANCELLED, serviceOffering);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));
        when(employeeScheduleRepository.findByEmployeeAndDayOfWeek(employee, date.getDayOfWeek())).thenReturn(List.of(employeeSchedule));
        when(appointmentRepository.findByEmployeeAndAppointmentDatetimeBetween(any(), any(),any())).thenReturn(List.of(appointment));

        List<LocalTime> slots = availabilityService.getAvailableSlots(1L, 1L, date);

        assertThat(slots).containsExactly(
                LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 0),
                LocalTime.of(12, 0), LocalTime.of(13, 0));

    }

    @Test
    void excludesTwoSlots_whenAppointmentPartiallyOverlaps(){

        EmployeeSchedule employeeSchedule = schedule(9, 14);
        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);
        Appointment appointment = appointment(date.atTime(10, 30), Status.PENDING, serviceOffering);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));
        when(employeeScheduleRepository.findByEmployeeAndDayOfWeek(employee, date.getDayOfWeek())).thenReturn(List.of(employeeSchedule));
        when(appointmentRepository.findByEmployeeAndAppointmentDatetimeBetween(any(), any(),any())).thenReturn(List.of(appointment));

        List<LocalTime> slots = availabilityService.getAvailableSlots(1L, 1L, date);

        assertThat(slots).containsExactly(
                LocalTime.of(9, 0), LocalTime.of(12, 0), LocalTime.of(13, 0));

    }

    @Test
    void throws_whenEmployeeIsInactive(){

        Business business = business(1L);
        Employee employee = employee(business);
        employee.setActive(false);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));

        assertThatThrownBy(() -> availabilityService.getAvailableSlots(1L, 1L, date))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee is not active");

    }

    @Test
    void throws_whenServiceOfferingIsInactive(){

        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        serviceOffering.setActive(false);
        LocalDate date = LocalDate.now().plusDays(1);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));

        assertThatThrownBy(() -> availabilityService.getAvailableSlots(1L, 1L, date))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Service offering is not active");

    }

    @Test
    void throws_whenBusinessIsInactive(){

        Business business = business(1L);
        business.setActive(false);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        LocalDate date = LocalDate.now().plusDays(1);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(serviceOfferingRepository.findById(1L)).thenReturn(Optional.of(serviceOffering));

        assertThatThrownBy(() -> availabilityService.getAvailableSlots(1L, 1L, date))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Business is not active");

    }

    @Test
    void throws_whenDateIsInThePast(){

        LocalDate date = LocalDate.now().minusDays(1);

        assertThatThrownBy(() -> availabilityService.getAvailableSlots(1L, 1L, date))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("past date");

    }

    private EmployeeSchedule schedule(int startHour, int endHour){
        EmployeeSchedule schedule = new EmployeeSchedule();
        schedule.setStartTime(LocalTime.of(startHour, 0));
        schedule.setEndTime(LocalTime.of(endHour, 0));
        return schedule;
    }

    private Business business(Long id){
        Business business = new Business();
        business.setId(id);
        return business;
    }

    private Employee employee(Business business){
        Employee employee = new Employee();
        employee.setBusiness(business);
        return employee;
    }

    private ServiceOffering serviceOffering(Business business, int duration){
        ServiceOffering serviceOffering = new ServiceOffering();
        serviceOffering.setBusiness(business);
        serviceOffering.setDuration(duration);
        return serviceOffering;
    }

    private Appointment appointment(LocalDateTime appointmentDatetime, Status status, ServiceOffering serviceOffering){
        Appointment appointment = new Appointment();
        appointment.setAppointmentDatetime(appointmentDatetime);
        appointment.setStatus(status);
        appointment.setServiceOffering(serviceOffering);
        return appointment;
    }

}
