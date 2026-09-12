package com.dani.bookit.dto;

import com.dani.bookit.entities.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {

    private Long id;
    private LocalDateTime appointmentDateTime;
    private Status status;
    private Long userId;
    private String userName;
    private Long serviceOfferingId;
    private String serviceOfferingName;
    private Long employeeId;
    private String employeeName;

}
