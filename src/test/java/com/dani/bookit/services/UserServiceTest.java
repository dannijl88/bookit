package com.dani.bookit.services;

import com.dani.bookit.dto.UserRequestDto;
import com.dani.bookit.dto.UserResponseDto;
import com.dani.bookit.entities.Role;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceAlreadyInUseException;
import com.dani.bookit.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository repository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void register_defaultsToClient_whenRoleIsNull(){

        UserRequestDto dto = new UserRequestDto("Dani", "dani@mail.com", "secret", "600000000", null);
        when(repository.existsByEmail("dani@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        UserResponseDto result = userService.register(dto);

        assertThat(result.getRole()).isEqualTo(Role.CLIENT);
        verify(repository).save(any());
    }

    @Test
    void register_usesBusinessOwner_whenRoleIsProvided(){

        UserRequestDto dto = new UserRequestDto("Dani", "dani@mail.com", "secret", "600000000", Role.BUSINESS_OWNER);
        when(repository.existsByEmail("dani@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        UserResponseDto result = userService.register(dto);

        assertThat(result.getRole()).isEqualTo(Role.BUSINESS_OWNER);
    }

    @Test
    void register_throws_whenEmailIsAlreadyInUse(){

        UserRequestDto dto = new UserRequestDto("Dani", "dani@mail.com", "secret", "600000000", Role.CLIENT);
        when(repository.existsByEmail("dani@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(ResourceAlreadyInUseException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void register_throws_whenRoleIsAdmin(){

        UserRequestDto dto = new UserRequestDto("Dani", "dani@mail.com", "secret", "600000000", Role.ADMIN);
        when(repository.existsByEmail("dani@mail.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(AccessDeniedCustomException.class);

        verify(repository, never()).save(any());
    }

}
