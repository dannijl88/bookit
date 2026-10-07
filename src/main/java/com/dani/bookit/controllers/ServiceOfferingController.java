package com.dani.bookit.controllers;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.ServiceOfferingService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Gestión de servicios")
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Crear servicio", description = "Crea un nuevo servicio para un negocio")
    @ApiResponse(responseCode = "201", description = "Servicio creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<ServiceOfferingResponseDto> create(
            @Valid @RequestBody ServiceOfferingRequestDto dto, @RequestParam Long businessId, @AuthenticationPrincipal CustomUserDetails userDetails){

        ServiceOfferingResponseDto created = service.create(dto, businessId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Actualizar servicio", description = "Actualiza un servicio existente")
    @ApiResponse(responseCode = "200", description = "Servicio actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ServiceOfferingResponseDto> update(
            @Valid @RequestBody ServiceOfferingRequestDto dto, @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.update(dto, id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Activar servicio", description = "Activa un servicio")
    @ApiResponse(responseCode = "200", description = "Servicio activado correctamente")
    @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ServiceOfferingResponseDto> activate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.activate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Desactivar servicio", description = "Desactiva un servicio")
    @ApiResponse(responseCode = "200", description = "Servicio desactivado correctamente")
    @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ServiceOfferingResponseDto> deactivate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.deactivate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }
}
