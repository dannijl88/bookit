package com.dani.bookit.controllers;

import com.dani.bookit.dto.TimeOffRequestDto;
import com.dani.bookit.dto.TimeOffResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.TimeOffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-off")
@RequiredArgsConstructor
@Tag(name = "Time Off", description = "Bloqueos de horas o días de un empleado (vacaciones, descansos)")
public class TimeOffController {

    private final TimeOffService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Bloquear horas o días de un empleado", description = "Crea un bloqueo de disponibilidad para un empleado")
    @ApiResponse(responseCode = "201", description = "Bloqueo creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    public ResponseEntity<TimeOffResponseDto> create(@Valid @RequestBody TimeOffRequestDto dto, @RequestParam Long employeeId, @AuthenticationPrincipal CustomUserDetails userDetails){
        TimeOffResponseDto created = service.create(dto, employeeId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Listar bloqueos de un empleado", description = "Obtiene todos los bloqueos de disponibilidad de un empleado")
    @ApiResponse(responseCode = "200", description = "Bloqueos obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    public ResponseEntity<List<TimeOffResponseDto>> findByEmployee(@PathVariable Long employeeId, @AuthenticationPrincipal CustomUserDetails userDetails){
        return ResponseEntity.ok(service.findByEmployee(employeeId, userDetails.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Eliminar un bloqueo", description = "Elimina un bloqueo de disponibilidad existente")
    @ApiResponse(responseCode = "204", description = "Bloqueo eliminado correctamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    @ApiResponse(responseCode = "404", description = "Bloqueo no encontrado")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        service.delete(id, userDetails.getUser().getId());
        return ResponseEntity.noContent().build();
    }

}
