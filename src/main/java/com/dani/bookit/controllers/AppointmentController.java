package com.dani.bookit.controllers;

import com.dani.bookit.dto.AppointmentRequestDto;
import com.dani.bookit.dto.AppointmentResponseDto;
import com.dani.bookit.dto.UpdateStatusDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> create(@Valid @RequestBody AppointmentRequestDto appointmentRequestDto, @AuthenticationPrincipal CustomUserDetails userDetails){

        AppointmentResponseDto dto = service.create(appointmentRequestDto, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusDto updateDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        AppointmentResponseDto dto = service.updateStatus(id, updateDto, userDetails.getUser().getId());
        return ResponseEntity.ok().body(dto);
    }

}
