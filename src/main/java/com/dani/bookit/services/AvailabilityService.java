package com.dani.bookit.services;

import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;
import com.dani.bookit.entities.ServiceOffering;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final EmployeeRepository employeeRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final EmployeeScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;

    public List<LocalTime> getAvailableSlots(Long employeeId, Long serviceOfferingId, LocalDate date){

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new ResourceNotFoundException("Employee not found with id: " + employeeId));
        ServiceOffering serviceOffering = serviceOfferingRepository.findById(serviceOfferingId).orElseThrow(() ->
                new ResourceNotFoundException("Service offering not found with id: " + serviceOfferingId));
        List<EmployeeSchedule> schedules = scheduleRepository.findByEmployeeAndDayOfWeek(employee, date.getDayOfWeek());
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<Appointment> newHours = appointmentRepository.findByEmployeeAndAppointmentDatetimeBetween(employee, startOfDay, endOfDay);
        List<LocalTime> availableHours = new ArrayList<>();
        int durationMinutes = serviceOffering.getDuration();
        for (EmployeeSchedule schedule : schedules) {
            LocalTime slotStart = schedule.getStartTime();

            while (!slotStart.plusMinutes(durationMinutes).isAfter(schedule.getEndTime())) {
                LocalTime slotEnd = slotStart.plusMinutes(durationMinutes);

                LocalTime finalSlotStart = slotStart;
                boolean overlaps = newHours.stream().anyMatch(appointment -> {
                    LocalTime apptStart = appointment.getAppointmentDatetime().toLocalTime();
                    LocalTime apptEnd = apptStart.plusMinutes(appointment.getServiceOffering().getDuration());
                    return finalSlotStart.isBefore(apptEnd) && apptStart.isBefore(slotEnd);
                });

                if (!overlaps) {
                    availableHours.add(slotStart);
                }

                slotStart = slotEnd;
            }
        }
        return availableHours;
    }

}
