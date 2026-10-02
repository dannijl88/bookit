package com.dani.bookit.controllers;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.EmployeeScheduleService;
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
public class EmployeeScheduleController {

    private final EmployeeScheduleService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<EmployeeScheduleResponseDto> create(@Valid @RequestBody EmployeeScheduleRequestDto dto, @RequestParam Long employeeId, @AuthenticationPrincipal CustomUserDetails userDetails){
        EmployeeScheduleResponseDto created = service.create(dto, employeeId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeScheduleResponseDto>> findByEmployee(@PathVariable Long employeeId){
        return ResponseEntity.ok(service.findByEmployee(employeeId));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<EmployeeScheduleResponseDto> update(@PathVariable Long id, @Valid @RequestBody EmployeeScheduleRequestDto dto, @AuthenticationPrincipal CustomUserDetails userDetails){
        return ResponseEntity.ok(service.update(id, dto, userDetails.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        service.delete(id, userDetails.getUser().getId());
        return ResponseEntity.noContent().build();
    }

}
