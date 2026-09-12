package com.dani.bookit.mappers;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.entities.*;

public class AppointmentMapper {

    public static Appointment toEntity(AppointmentRequestDto dto, ServiceOffering service, Employee employee, User client){

        Appointment appointment = new Appointment();
        appointment.setAppointmentDatetime(dto.getAppointmentDateTime());
        appointment.setEmployee(employee);
        appointment.setServiceOffering(service);
        appointment.setClient(client);
        return appointment;

    }

    public static AppointmentResponseDto toDto(Appointment appointment){

        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(appointment.getId());
        dto.setStatus(Status.PENDING);
        dto.setAppointmentDateTime(appointment.getAppointmentDatetime());
        dto.setEmployeeId(appointment.getEmployee().getId());
        dto.setEmployeeName(appointment.getEmployee().getName());
        dto.setUserId(appointment.getClient().getId());
        dto.setUserName(appointment.getClient().getName());
        dto.setServiceOfferingId(appointment.getServiceOffering().getId());
        dto.setServiceOfferingName(appointment.getServiceOffering().getName());
        return dto;

    }

}
