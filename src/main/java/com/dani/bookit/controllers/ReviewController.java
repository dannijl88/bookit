package com.dani.bookit.controllers;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    public ResponseEntity<ReviewResponseDto> create(@Valid @RequestBody ReviewRequestDto dto, @RequestParam Long appointmentId){
        ReviewResponseDto created = service.create(dto, appointmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
