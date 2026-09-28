package com.dani.bookit.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter @Getter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentRequestDto {

    @NotNull
    @Future
    private LocalDateTime appointmentDateTime;

    @NotNull
    private Long serviceId;

    @NotNull
    private Long employeeId;
}
