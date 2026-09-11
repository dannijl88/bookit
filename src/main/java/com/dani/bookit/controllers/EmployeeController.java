package com.dani.bookit.controllers;

import com.dani.bookit.dto.EmployeeRequestDto;
import com.dani.bookit.dto.EmployeeResponseDto;
import com.dani.bookit.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService service;

    @PostMapping
    public ResponseEntity<EmployeeResponseDto> create(@Valid @RequestBody EmployeeRequestDto dto, @RequestParam Long businessId){
        EmployeeResponseDto employee = service.create(dto, businessId);
        return ResponseEntity.status(HttpStatus.CREATED).body(employee);
    }

}
