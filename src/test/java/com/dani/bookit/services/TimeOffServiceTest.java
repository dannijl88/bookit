package com.dani.bookit.services;

import com.dani.bookit.dto.TimeOffRequestDto;
import com.dani.bookit.dto.TimeOffResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.TimeOff;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.TimeOffRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TimeOffServiceTest {

    @Mock
    private TimeOffRepository timeOffRepository;
    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private TimeOffService timeOffService;

    private static final Long OWNER_ID = 1L;

    @Test
    void create_savesTimeOff_whenUserIsTheOwner(){

        Employee employee = employee();
        TimeOffRequestDto dto = new TimeOffRequestDto(
                LocalDateTime.of(2026, 12, 24, 0, 0),
                LocalDateTime.of(2026, 12, 26, 0, 0),
                "Vacaciones");

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        TimeOffResponseDto result = timeOffService.create(dto, 2L, OWNER_ID);

        assertThat(result.getReason()).isEqualTo("Vacaciones");
        assertThat(result.getEmployeeId()).isEqualTo(2L);
        verify(timeOffRepository).save(any(TimeOff.class));

    }

    @Test
    void create_throws_whenUserIsNotTheOwner(){

        Employee employee = employee();
        TimeOffRequestDto dto = new TimeOffRequestDto(
                LocalDateTime.of(2026, 12, 24, 0, 0),
                LocalDateTime.of(2026, 12, 26, 0, 0),
                "Vacaciones");

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> timeOffService.create(dto, 2L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

        verify(timeOffRepository, never()).save(any());

    }

    @Test
    void create_throws_whenEmployeeDoesNotExist(){

        TimeOffRequestDto dto = new TimeOffRequestDto(
                LocalDateTime.of(2026, 12, 24, 0, 0),
                LocalDateTime.of(2026, 12, 26, 0, 0),
                "Vacaciones");

        when(employeeRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> timeOffService.create(dto, 2L, OWNER_ID))
                .isInstanceOf(ResourceNotFoundException.class);

    }

    @Test
    void findByEmployee_returnsTimeOffs_whenUserIsTheOwner(){

        Employee employee = employee();
        TimeOff timeOff = timeOff(employee);

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(timeOffRepository.findByEmployee(employee)).thenReturn(List.of(timeOff));

        List<TimeOffResponseDto> result = timeOffService.findByEmployee(2L, OWNER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployeeName()).isEqualTo("Ana");

    }

    @Test
    void findByEmployee_throws_whenUserIsNotTheOwner(){

        Employee employee = employee();

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> timeOffService.findByEmployee(2L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

    }

    @Test
    void delete_removesTimeOff_whenUserIsTheOwner(){

        TimeOff timeOff = timeOff(employee());

        when(timeOffRepository.findById(5L)).thenReturn(Optional.of(timeOff));

        timeOffService.delete(5L, OWNER_ID);

        verify(timeOffRepository).delete(timeOff);

    }

    @Test
    void delete_throws_whenUserIsNotTheOwner(){

        TimeOff timeOff = timeOff(employee());

        when(timeOffRepository.findById(5L)).thenReturn(Optional.of(timeOff));

        assertThatThrownBy(() -> timeOffService.delete(5L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

        verify(timeOffRepository, never()).delete(any());

    }

    private Employee employee(){
        User owner = new User();
        owner.setId(OWNER_ID);
        owner.setName("Owner");
        Business business = new Business();
        business.setId(1L);
        business.setOwner(owner);
        Employee employee = new Employee();
        employee.setId(2L);
        employee.setName("Ana");
        employee.setBusiness(business);
        return employee;
    }

    private TimeOff timeOff(Employee employee){
        TimeOff timeOff = new TimeOff();
        timeOff.setId(5L);
        timeOff.setStartDatetime(LocalDateTime.of(2026, 12, 24, 0, 0));
        timeOff.setEndDatetime(LocalDateTime.of(2026, 12, 26, 0, 0));
        timeOff.setReason("Vacaciones");
        timeOff.setEmployee(employee);
        return timeOff;
    }

}
