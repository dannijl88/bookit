package com.dani.bookit.services;

import com.dani.bookit.dto.EmployeeScheduleRequestDto;
import com.dani.bookit.dto.EmployeeScheduleResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.EmployeeSchedule;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ScheduleOverlapException;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.EmployeeScheduleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmployeeScheduleServiceTest {

    @Mock
    private EmployeeScheduleRepository repository;
    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeScheduleService employeeScheduleService;

    private static final Long OWNER_ID = 1L;

    @Test
    void create_savesSchedule_whenThereIsNoOverlap(){

        Employee employee = employee();
        EmployeeScheduleRequestDto dto = new EmployeeScheduleRequestDto(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(11, 0));

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(repository.findByEmployeeAndDayOfWeek(employee, DayOfWeek.MONDAY)).thenReturn(List.of());

        EmployeeScheduleResponseDto result = employeeScheduleService.create(dto, 2L, OWNER_ID);

        assertThat(result.getStartTime()).isEqualTo(LocalTime.of(9, 0));
        verify(repository).save(any(EmployeeSchedule.class));

    }

    @Test
    void create_throws_whenScheduleOverlapsExistingOne(){

        Employee employee = employee();
        EmployeeSchedule existing = schedule(5L, LocalTime.of(10, 0), LocalTime.of(12, 0));
        EmployeeScheduleRequestDto dto = new EmployeeScheduleRequestDto(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(11, 0));

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(repository.findByEmployeeAndDayOfWeek(employee, DayOfWeek.MONDAY)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> employeeScheduleService.create(dto, 2L, OWNER_ID))
                .isInstanceOf(ScheduleOverlapException.class);

        verify(repository, never()).save(any());

    }

    @Test
    void create_throws_whenUserIsNotTheOwner(){

        Employee employee = employee();
        EmployeeScheduleRequestDto dto = new EmployeeScheduleRequestDto(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(11, 0));

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> employeeScheduleService.create(dto, 2L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

    }

    @Test
    void update_saves_whenOverlapIsItsOwnSchedule(){

        EmployeeSchedule schedule = schedule(5L, LocalTime.of(9, 0), LocalTime.of(11, 0));
        EmployeeScheduleRequestDto dto = new EmployeeScheduleRequestDto(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(13, 0));

        when(repository.findById(5L)).thenReturn(Optional.of(schedule));
        when(repository.findByEmployeeAndDayOfWeek(schedule.getEmployee(), DayOfWeek.MONDAY)).thenReturn(List.of(schedule));

        EmployeeScheduleResponseDto result = employeeScheduleService.update(5L, dto, OWNER_ID);

        assertThat(result.getEndTime()).isEqualTo(LocalTime.of(13, 0));
        verify(repository).save(schedule);

    }

    @Test
    void update_throws_whenOverlapsAnotherSchedule(){

        EmployeeSchedule schedule = schedule(5L, LocalTime.of(9, 0), LocalTime.of(11, 0));
        EmployeeSchedule other = schedule(6L, LocalTime.of(12, 0), LocalTime.of(14, 0));
        EmployeeScheduleRequestDto dto = new EmployeeScheduleRequestDto(DayOfWeek.MONDAY, LocalTime.of(10, 0), LocalTime.of(13, 0));

        when(repository.findById(5L)).thenReturn(Optional.of(schedule));
        when(repository.findByEmployeeAndDayOfWeek(schedule.getEmployee(), DayOfWeek.MONDAY)).thenReturn(List.of(schedule, other));

        assertThatThrownBy(() -> employeeScheduleService.update(5L, dto, OWNER_ID))
                .isInstanceOf(ScheduleOverlapException.class);

        verify(repository, never()).save(any());

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

    private EmployeeSchedule schedule(Long id, LocalTime start, LocalTime end){
        EmployeeSchedule schedule = new EmployeeSchedule();
        schedule.setId(id);
        schedule.setDayOfWeek(DayOfWeek.MONDAY);
        schedule.setStartTime(start);
        schedule.setEndTime(end);
        schedule.setEmployee(employee());
        return schedule;
    }

}
