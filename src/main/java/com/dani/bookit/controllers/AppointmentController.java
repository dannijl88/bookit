package com.dani.bookit.controllers;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.dto.UpdateStatusDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Reserva, consulta y cancelación de citas")
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Crear cita", description = "Permite a un cliente crear una nueva cita")
    @ApiResponse(responseCode = "201", description = "Cita creada correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Recurso no encontrado")
    public ResponseEntity<AppointmentResponseDto> create(@Valid @RequestBody AppointmentRequestDto appointmentRequestDto, @AuthenticationPrincipal CustomUserDetails userDetails){

        AppointmentResponseDto dto = service.create(appointmentRequestDto, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('BUSINESS_OWNER', 'ADMIN')")
    @Operation(summary = "Actualizar estado de cita", description = "Actualiza el estado de una cita existente")
    @ApiResponse(responseCode = "200", description = "Estado actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Cita no encontrada")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<AppointmentResponseDto> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusDto updateDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        AppointmentResponseDto dto = service.updateStatus(id, updateDto, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/me")
    @Operation(summary = "Mis citas", description = "Obtiene las citas del cliente autenticado")
    @ApiResponse(responseCode = "200", description = "Lista de citas obtenida correctamente")
    public ResponseEntity<Page<AppointmentResponseDto>> getMyAppointments(@AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable){
        Page<AppointmentResponseDto> appointments = service.findByClient(userDetails.getUser().getId(), pageable);
        return ResponseEntity.ok().body(appointments);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar cita", description = "Cancela una cita existente")
    @ApiResponse(responseCode = "200", description = "Cita cancelada correctamente")
    @ApiResponse(responseCode = "404", description = "Cita no encontrada")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<AppointmentResponseDto> cancel(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        AppointmentResponseDto dto = service.cancel(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

}
