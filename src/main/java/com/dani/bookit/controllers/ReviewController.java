package com.dani.bookit.controllers;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Gestión de reseñas")
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Crear reseña", description = "Permite a un cliente crear una reseña para una cita")
    @ApiResponse(responseCode = "201", description = "Reseña creada correctamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Cita no encontrada")
    public ResponseEntity<ReviewResponseDto> create(@Valid @RequestBody ReviewRequestDto dto, @RequestParam Long appointmentId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ReviewResponseDto created = service.create(dto, appointmentId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Eliminar reseña", description = "Elimina una reseña existente")
    @ApiResponse(responseCode = "204", description = "Reseña eliminada correctamente")
    @ApiResponse(responseCode = "404", description = "Reseña no encontrada")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        service.delete(id, userDetails.getUser().getId());
        return ResponseEntity.noContent().build();
    }

}
