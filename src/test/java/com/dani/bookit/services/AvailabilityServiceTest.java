package com.dani.bookit.services;

import com.dani.bookit.entities.*;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.LocalTime;

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
    void createAppointment(){


        EmployeeSchedule employeeSchedule = schedule(9, 14);
        Business business = business(1L);
        Employee employee = employee(business);
        ServiceOffering serviceOffering = serviceOffering(business, 60);
        Appointment appointment = appointment(
                LocalDateTime.of(2026, 10, 12, 11, 0), Status.PENDING, serviceOffering);



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
