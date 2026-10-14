package com.dani.bookit.services;

import com.dani.bookit.dto.UserRequestDto;
import com.dani.bookit.dto.UserResponseDto;
import com.dani.bookit.entities.Role;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceAlreadyInUseException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.UserMapper;
import com.dani.bookit.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDto register(UserRequestDto dto){

        if (repository.existsByEmail(dto.getEmail())){
            throw new ResourceAlreadyInUseException("Email already in use");
        }
        Role role = dto.getRole() == null ? Role.CLIENT : dto.getRole();

        if (role != Role.CLIENT && role != Role.BUSINESS_OWNER) {
            throw new AccessDeniedCustomException("Role not allowed for registration");
        }
        User newUser = UserMapper.toEntity(dto);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setRole(role);

        repository.save(newUser);
        return UserMapper.toResponseDto(newUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getById(Long userId){
        User user = repository.findById(userId).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + userId));
        return UserMapper.toResponseDto(user);
    }

}
