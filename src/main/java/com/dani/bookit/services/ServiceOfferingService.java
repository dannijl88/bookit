package com.dani.bookit.services;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.ServiceOffering;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.ServiceOfferingMapper;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceOfferingService {

    private final ServiceOfferingRepository repository;
    private final BusinessRepository businessRepository;

    public ServiceOfferingResponseDto create(ServiceOfferingRequestDto dto, Long businessId, Long userId){

        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id: " + businessId));
        if(!business.getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        ServiceOffering newServiceOffering = ServiceOfferingMapper.toEntity(dto, business);
        repository.save(newServiceOffering);
        return ServiceOfferingMapper.toServiceResponse(newServiceOffering);

    }

    public List<ServiceOfferingResponseDto> findByBusiness(Long businessId){

        Business business = businessRepository.findById(businessId).orElseThrow(() ->
                new ResourceNotFoundException("Business not found with id: " + businessId));
        return repository.findByBusinessAndActiveTrue(business).stream().map(ServiceOfferingMapper::toServiceResponse).toList();

    }

    public ServiceOfferingResponseDto update(ServiceOfferingRequestDto dto, Long serviceOfferingId, Long userId){

        ServiceOffering serviceOffering = repository.findById(serviceOfferingId).orElseThrow(() ->
                new ResourceNotFoundException("Service not found with id: " + serviceOfferingId));
        if(!serviceOffering.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        serviceOffering.setDescription(dto.getDescription());
        serviceOffering.setDuration(dto.getDuration());
        serviceOffering.setPrice(dto.getPrice());
        repository.save(serviceOffering);
        return ServiceOfferingMapper.toServiceResponse(serviceOffering);
    }

    public ServiceOfferingResponseDto activate(Long serviceOfferingId, Long userId){
        ServiceOffering serviceOffering = repository.findById(serviceOfferingId).orElseThrow(() ->
                new ResourceNotFoundException("Service not found with id: " + serviceOfferingId));
        if(!serviceOffering.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        serviceOffering.setActive(true);
        repository.save(serviceOffering);
        return ServiceOfferingMapper.toServiceResponse(serviceOffering);
    }

    public ServiceOfferingResponseDto deactivate(Long serviceOfferingId, Long userId){
        ServiceOffering serviceOffering = repository.findById(serviceOfferingId).orElseThrow(() ->
                new ResourceNotFoundException("Service not found with id: " + serviceOfferingId));
        if(!serviceOffering.getBusiness().getOwner().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        serviceOffering.setActive(false);
        repository.save(serviceOffering);
        return ServiceOfferingMapper.toServiceResponse(serviceOffering);
    }

}
