package com.dani.bookit.mappers;

import com.dani.bookit.dto.ServiceOfferingRequestDto;
import com.dani.bookit.dto.ServiceOfferingResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.ServiceOffering;

public class ServiceOfferingMapper {

    public static ServiceOffering toEntity(ServiceOfferingRequestDto dto, Business business){
        ServiceOffering serviceOffering = new ServiceOffering();
        serviceOffering.setName(dto.getName());
        serviceOffering.setPrice(dto.getPrice());
        serviceOffering.setDuration(dto.getDuration());
        serviceOffering.setDescription(dto.getDescription());
        serviceOffering.setBusiness(business);
        return serviceOffering;
    }

    public static ServiceOfferingResponseDto toServiceResponse(ServiceOffering serviceOffering){
        ServiceOfferingResponseDto dto = new ServiceOfferingResponseDto();
        dto.setId(serviceOffering.getId());
        dto.setName(serviceOffering.getName());
        dto.setDescription(serviceOffering.getDescription());
        dto.setDuration(serviceOffering.getDuration());
        dto.setPrice(serviceOffering.getPrice());
        dto.setBusinessId(serviceOffering.getBusiness().getId());
        dto.setBusinessName(serviceOffering.getBusiness().getName());
        return dto;
    }

}
