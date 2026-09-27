package com.dani.bookit.controllers;

import com.dani.bookit.services.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService service;

    @GetMapping
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam Long employeeId,
            @RequestParam Long serviceOfferingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){

        List<LocalTime> slots = service.getAvailableSlots(employeeId, serviceOfferingId, date);
        return ResponseEntity.ok().body(slots);

    }

}
