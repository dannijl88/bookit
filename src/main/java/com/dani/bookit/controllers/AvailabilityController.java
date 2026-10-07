package com.dani.bookit.controllers;

import com.dani.bookit.services.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Availability", description = "Disponibilidad de empleados")
public class AvailabilityController {

    private final AvailabilityService service;

    @GetMapping
    @Operation(summary = "Obtener slots disponibles", description = "Obtiene los horarios disponibles para un empleado y servicio en una fecha")
    @ApiResponse(responseCode = "200", description = "Slots disponibles obtenidos correctamente")
    @ApiResponse(responseCode = "404", description = "Empleado o servicio no encontrado")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam Long employeeId,
            @RequestParam Long serviceOfferingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){

        List<LocalTime> slots = service.getAvailableSlots(employeeId, serviceOfferingId, date);
        return ResponseEntity.ok().body(slots);

    }

}
