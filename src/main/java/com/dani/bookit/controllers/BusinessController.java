package com.dani.bookit.controllers;

import com.dani.bookit.dto.*;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Review;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.*;
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

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
@Tag(name = "Businesses", description = "Gestión de negocios")
public class BusinessController {

    private final BusinessService service;
    private final ServiceOfferingService serviceOfferingService;
    private final AppointmentService appointmentService;
    private final ReviewService reviewService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Crear negocio", description = "Permite a un propietario crear un nuevo negocio")
    @ApiResponse(responseCode = "201", description = "Negocio creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<BusinessResponseDto> create(
            @Valid @RequestBody BusinessRequestDto dto, @AuthenticationPrincipal CustomUserDetails userDetails){
        Long ownerId = userDetails.getUser().getId();
        BusinessResponseDto business = service.create(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(business);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @Operation(summary = "Actualizar negocio", description = "Actualiza los datos de un negocio")
    @ApiResponse(responseCode = "200", description = "Negocio actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<BusinessResponseDto> update(
            @Valid @RequestBody BusinessRequestDto dto, @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        BusinessResponseDto updatedDto = service.update(dto, id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @GetMapping
    @Operation(summary = "Listar negocios por categoría", description = "Obtiene una lista paginada de negocios por categoría")
    @ApiResponse(responseCode = "200", description = "Lista de negocios obtenida correctamente")
    public ResponseEntity<Page<BusinessResponseDto>> getBusinesses(@RequestParam String category, Pageable pageable){
        return ResponseEntity.ok(service.findByCategory(category, pageable));
    }

    @GetMapping("/{businessId}/services")
    @Operation(summary = "Obtener servicios del negocio", description = "Lista los servicios ofrecidos por un negocio")
    @ApiResponse(responseCode = "200", description = "Servicios obtenidos correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<List<ServiceOfferingResponseDto>> findByBusiness(@PathVariable Long businessId){
        List<ServiceOfferingResponseDto> services = serviceOfferingService.findByBusiness(businessId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{businessId}/appointments")
    @Operation(summary = "Citas del negocio", description = "Obtiene las citas de un negocio para el propietario")
    @ApiResponse(responseCode = "200", description = "Citas obtenidas correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<Page<AppointmentResponseDto>> findByEmployee(
            @PathVariable Long businessId, @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable){
        Page<AppointmentResponseDto> dto = appointmentService.findByBusiness(businessId, userDetails.getUser().getId(), pageable);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{businessId}/reviews")
    @Operation(summary = "Reseñas del negocio", description = "Obtiene las reseñas de un negocio")
    @ApiResponse(responseCode = "200", description = "Reseñas obtenidas correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsByBusiness(@PathVariable Long businessId, Pageable pageable){
        Page<ReviewResponseDto> dto = reviewService.getReviewsByBusiness(businessId, pageable);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{businessId}/employees")
    @Operation(summary = "Empleados del negocio", description = "Obtiene la lista de empleados de un negocio")
    @ApiResponse(responseCode = "200", description = "Empleados obtenidos correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    public ResponseEntity<List<EmployeeResponseDto>> getEmployeeByBusiness(@PathVariable Long businessId){
        List<EmployeeResponseDto> dto = employeeService.findByBusiness(businessId);
        return ResponseEntity.ok().body(dto);
    }

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activar negocio", description = "Activa un negocio")
    @ApiResponse(responseCode = "200", description = "Negocio activado correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<BusinessResponseDto> activate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        BusinessResponseDto dto = service.activate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desactivar negocio", description = "Desactiva un negocio")
    @ApiResponse(responseCode = "200", description = "Negocio desactivado correctamente")
    @ApiResponse(responseCode = "404", description = "Negocio no encontrado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<BusinessResponseDto> deactivate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        BusinessResponseDto dto = service.deactivate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

}
