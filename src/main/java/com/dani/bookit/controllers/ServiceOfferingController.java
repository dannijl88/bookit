package com.dani.bookit.controllers;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.services.ServiceOfferingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    @PostMapping
    public ResponseEntity<ServiceOfferingResponseDto> create(@Valid @RequestBody ServiceOfferingRequestDto dto, @RequestParam Long businessId){

        ServiceOfferingResponseDto created = service.create(dto, businessId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

}
