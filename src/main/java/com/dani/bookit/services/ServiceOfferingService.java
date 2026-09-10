package com.dani.bookit.services;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.ServiceOffering;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.ServiceOfferingMapper;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.ServiceOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceOfferingService {

    private final ServiceOfferingRepository repository;
    private final BusinessRepository businessRepository;

    public ServiceOfferingResponseDto create(ServiceOfferingRequestDto dto, Long businessId){

        Business business = businessRepository.findById(businessId).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        ServiceOffering newServiceOffering = ServiceOfferingMapper.toEntity(dto, business);
        repository.save(newServiceOffering);
        return ServiceOfferingMapper.toServiceResponse(newServiceOffering);

    }

}
