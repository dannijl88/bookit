package com.dani.bookit.controllers;

import com.dani.bookit.dto.EmployeeRequestDto;
import com.dani.bookit.dto.EmployeeResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.EmployeeService;
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

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Gestión de empleados")
public class EmployeeController {

    private final EmployeeService service;

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PostMapping
    @Operation(summary = "Crear empleado", description = "Crea un nuevo empleado para un negocio")
    @ApiResponse(responseCode = "201", description = "Empleado creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<EmployeeResponseDto> create(@Valid @RequestBody EmployeeRequestDto dto, @RequestParam Long businessId, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeResponseDto employee = service.create(dto, businessId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(employee);
    }

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar empleado", description = "Actualiza los datos de un empleado")
    @ApiResponse(responseCode = "200", description = "Empleado actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EmployeeResponseDto> update(@Valid @RequestBody EmployeeRequestDto dto, @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeResponseDto updatedDto = service.update(id, userDetails.getUser().getId(), dto);
        return ResponseEntity.ok().body(updatedDto);
    }

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activar empleado", description = "Activa un empleado")
    @ApiResponse(responseCode = "200", description = "Empleado activado correctamente")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EmployeeResponseDto> activate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeResponseDto dto = service.activate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desactivar empleado", description = "Desactiva un empleado")
    @ApiResponse(responseCode = "200", description = "Empleado desactivado correctamente")
    @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EmployeeResponseDto> deactivate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeResponseDto dto = service.deactivate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

}
