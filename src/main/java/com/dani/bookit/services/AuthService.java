package com.dani.bookit.services;

import com.dani.bookit.dto.LoginRequestDto;
import com.dani.bookit.dto.LoginResponseDto;
import com.dani.bookit.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponseDto login(LoginRequestDto dto){

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
        authenticationManager.authenticate(token);
        String jwt = jwtService.generateToken(dto.getEmail());
        return new LoginResponseDto(jwt);

    }

}
