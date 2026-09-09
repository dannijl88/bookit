package com.dani.bookit.mappers;

import com.dani.bookit.dto.UserRequestDto;
import com.dani.bookit.dto.UserResponseDto;
import com.dani.bookit.entities.User;

public class UserMapper {

    public static User toEntity(UserRequestDto dto){

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPassword(dto.getPassword());

        return user;

    }

    public static UserResponseDto toResponseDto(User user){

        UserResponseDto dto = new UserResponseDto();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setId(user.getId());
        dto.setRole(user.getRole());

        return dto;
    }

}
