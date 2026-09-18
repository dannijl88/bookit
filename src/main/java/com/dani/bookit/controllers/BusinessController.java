package com.dani.bookit.controllers;

import com.dani.bookit.dto.BusinessRequestDto;
import com.dani.bookit.dto.BusinessResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.BusinessService;
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
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService service;

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<BusinessResponseDto> create(@Valid @RequestBody BusinessRequestDto dto, @AuthenticationPrincipal CustomUserDetails userDetails){
        Long ownerId = userDetails.getUser().getId();
        BusinessResponseDto business = service.create(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(business);
    }

    @GetMapping
    public ResponseEntity<Page<BusinessResponseDto>> getBusinesses(@RequestParam String category, Pageable pageable){
        return ResponseEntity.ok(service.findByCategory(category, pageable));
    }

}
