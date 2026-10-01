package com.dani.bookit.controllers;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.ServiceOfferingService;
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
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ServiceOfferingResponseDto> create(
            @Valid @RequestBody ServiceOfferingRequestDto dto, @RequestParam Long businessId, @AuthenticationPrincipal CustomUserDetails userDetails){

        ServiceOfferingResponseDto created = service.create(dto, businessId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ServiceOfferingResponseDto> update(
            @Valid @RequestBody ServiceOfferingRequestDto dto, @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.update(dto, id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ServiceOfferingResponseDto> activate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.activate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<ServiceOfferingResponseDto> deactivate(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        ServiceOfferingResponseDto updatedDto = service.deactivate(id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }
}
