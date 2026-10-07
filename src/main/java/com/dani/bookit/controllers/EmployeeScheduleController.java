package com.dani.bookit.controllers;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.EmployeeScheduleService;
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
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Tag(name = "Employee Schedules", description = "Gestión de horarios de empleados")
public class EmployeeScheduleController {

    private final EmployeeScheduleService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Crear horario de empleado", description = "Crea un nuevo horario para un empleado")
    @ApiResponse(responseCode = "201", description = "Horario creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    public ResponseEntity<EmployeeScheduleResponseDto> create(@Valid @RequestBody EmployeeScheduleRequestDto dto, @RequestParam Long employeeId, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeScheduleResponseDto created = service.create(dto, employeeId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Obtener horarios del empleado", description = "Obtiene todos los horarios de un empleado")
    @ApiResponse(responseCode = "200", description = "Horarios obtenidos correctamente")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    public ResponseEntity<List<EmployeeScheduleResponseDto>> findByEmployee(@PathVariable Long employeeId){
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Actualizar horario", description = "Actualiza un horario existente")
    @ApiResponse(responseCode = "200", description = "Horario actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Horario no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EmployeeScheduleResponseDto> update(@PathVariable Long id, @Valid @RequestBody EmployeeScheduleRequestDto dto, @AuthenticationPrincipal CustomUserDetails userDetails){
        return ResponseEntity.ok(service.update(id, dto, userDetails.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Eliminar horario", description = "Elimina un horario existente")
    @ApiResponse(responseCode = "204", description = "Horario eliminado correctamente")
    @ApiResponse(responseCode = "404", description = "Horario no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        service.delete(id, userDetails.getUser().getId());
        return ResponseEntity.noContent().build();
    }

}
