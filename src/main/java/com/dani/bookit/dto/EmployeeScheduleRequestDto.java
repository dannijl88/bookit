package com.dani.bookit.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeScheduleRequestDto {

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;

    @AssertTrue(message = "endTime must be after startTime")
    public boolean isTimeRangeValid(){
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }

}
