package com.dani.bookit.controllers;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.security.CustomUserDetails;
import com.dani.bookit.services.ReviewService;
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
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ReviewResponseDto> create(@Valid @RequestBody ReviewRequestDto dto, @RequestParam Long appointmentId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ReviewResponseDto created = service.create(dto, appointmentId, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
