package com.dani.bookit.services;

import com.dani.bookit.dto.BusinessResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Employee;
import com.dani.bookit.entities.ServiceOffering;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.EmployeeRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import com.dani.bookit.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BusinessServiceTest {

    @Mock
    private BusinessRepository repository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ServiceOfferingRepository serviceOfferingRepository;

    @InjectMocks
    private BusinessService businessService;

    @Test
    void deactivate_deactivatesBusinessEmployeesAndServices(){

        Business business = business(1L);
        Employee employee = employee(2L, business);
        ServiceOffering serviceOffering = serviceOffering(3L, business);

        when(repository.findById(1L)).thenReturn(Optional.of(business));
        when(employeeRepository.findByBusiness(business)).thenReturn(List.of(employee));
        when(serviceOfferingRepository.findByBusiness(business)).thenReturn(List.of(serviceOffering));

        BusinessResponseDto result = businessService.deactivate(1L, 1L);

        assertThat(result.getActive()).isFalse();
        assertThat(employee.getActive()).isFalse();
        assertThat(serviceOffering.getActive()).isFalse();
        verify(employeeRepository).saveAll(List.of(employee));
        verify(serviceOfferingRepository).saveAll(List.of(serviceOffering));
        verify(repository).save(business);
    }

    @Test
    void deactivate_throws_whenUserIsNotTheOwner(){

        Business business = business(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(business));

        assertThatThrownBy(() -> businessService.deactivate(1L, 999L))
                .isInstanceOf(AccessDeniedCustomException.class);

        verify(repository, never()).save(business);
        verify(employeeRepository, never()).findByBusiness(business);
    }

    @Test
    void findById_returnsBusiness_whenItIsActive(){

        Business business = business(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(business));

        BusinessResponseDto result = businessService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Business 1");
        assertThat(result.getActive()).isTrue();
    }

    @Test
    void findById_throws_whenBusinessDoesNotExist(){

        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> businessService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findById_throws_whenBusinessIsInactive(){

        Business business = business(1L);
        business.setActive(false);

        when(repository.findById(1L)).thenReturn(Optional.of(business));

        assertThatThrownBy(() -> businessService.findById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private Business business(Long id){
        User owner = new User();
        owner.setId(1L);
        owner.setName("Owner");
        Business business = new Business();
        business.setId(id);
        business.setName("Business " + id);
        business.setOwner(owner);
        business.setActive(true);
        return business;
    }

    private Employee employee(Long id, Business business){
        Employee employee = new Employee();
        employee.setId(id);
        employee.setName("Ana");
        employee.setBusiness(business);
        employee.setActive(true);
        return employee;
    }

    private ServiceOffering serviceOffering(Long id, Business business){
        ServiceOffering serviceOffering = new ServiceOffering();
        serviceOffering.setId(id);
        serviceOffering.setName("Corte");
        serviceOffering.setBusiness(business);
        serviceOffering.setActive(true);
        return serviceOffering;
    }

}
