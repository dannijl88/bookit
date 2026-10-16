package com.dani.bookit.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class TimeOffRequestDto {

    @NotNull
    private LocalDateTime startDatetime;
    @NotNull
    private LocalDateTime endDatetime;

    private String reason;

    @AssertTrue(message = "endDatetime must be after startDatetime")
    public boolean isRangeValid(){
        return startDatetime == null || endDatetime == null || endDatetime.isAfter(startDatetime);
    }

}
