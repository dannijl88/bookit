package com.dani.bookit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class TimeOffResponseDto {

    private Long id;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String reason;

    private Long employeeId;
    private String employeeName;

}
