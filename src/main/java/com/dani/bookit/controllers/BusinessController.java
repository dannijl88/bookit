package com.dani.bookit.controllers;

import com.dani.bookit.dto.*;
import com.dani.bookit.entities.Review;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.*;
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
public class BusinessController {

    private final BusinessService service;
    private final ServiceOfferingService serviceOfferingService;
    private final AppointmentService appointmentService;
    private final ReviewService reviewService;
    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<BusinessResponseDto> create(
            @Valid @RequestBody BusinessRequestDto dto, @AuthenticationPrincipal CustomUserDetails userDetails){
        Long ownerId = userDetails.getUser().getId();
        BusinessResponseDto business = service.create(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(business);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<BusinessResponseDto> update(
            @Valid @RequestBody BusinessRequestDto dto, @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails){
        BusinessResponseDto updatedDto = service.update(dto, id, userDetails.getUser().getId());
        return ResponseEntity.ok().body(updatedDto);
    }

    @GetMapping
    public ResponseEntity<Page<BusinessResponseDto>> getBusinesses(@RequestParam String category, Pageable pageable){
        return ResponseEntity.ok(service.findByCategory(category, pageable));
    }

    @GetMapping("/{businessId}/services")
    public ResponseEntity<List<ServiceOfferingResponseDto>> findByBusiness(@PathVariable Long businessId){
        List<ServiceOfferingResponseDto> services = serviceOfferingService.findByBusiness(businessId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{businessId}/appointments")
    public ResponseEntity<Page<AppointmentResponseDto>> findByEmployee(
            @PathVariable Long businessId, @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable){
        Page<AppointmentResponseDto> dto = appointmentService.findByBusiness(businessId, userDetails.getUser().getId(), pageable);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{businessId}/reviews")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsByBusiness(@PathVariable Long businessId, Pageable pageable){
        Page<ReviewResponseDto> dto = reviewService.getReviewsByBusiness(businessId, pageable);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{businessId}/employees")
    public ResponseEntity<List<EmployeeResponseDto>> getEmployeeByBusiness(@PathVariable Long businessId){
        List<EmployeeResponseDto> dto = employeeService.findByBusiness(businessId);
        return ResponseEntity.ok().body(dto);
    }

}
