package com.dani.bookit.services;

import com.dani.bookit.dto.UserRequestDto;
import com.dani.bookit.dto.UserResponseDto;
import com.dani.bookit.entities.Role;
import com.dani.bookit.entities.User;
import com.dani.bookit.mappers.UserMapper;
import com.dani.bookit.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDto register(UserRequestDto dto){

        if (repository.existsByEmail(dto.getEmail())){
            throw new RuntimeException("Email already in use");
        }
        User newUser = UserMapper.toEntity(dto);

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setRole(Role.CLIENT);

        repository.save(newUser);
        return UserMapper.toResponseDto(newUser);
    }

}
