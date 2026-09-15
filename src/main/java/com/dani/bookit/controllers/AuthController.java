package com.dani.bookit.controllers;

import com.dani.bookit.dto.LoginRequestDto;
import com.dani.bookit.dto.LoginResponseDto;
import com.dani.bookit.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto){
        LoginResponseDto token = service.login(dto);
        return ResponseEntity.ok().body(token);
    }

}
