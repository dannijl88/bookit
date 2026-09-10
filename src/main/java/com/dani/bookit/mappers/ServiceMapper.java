package com.dani.bookit.mappers;

import com.dani.bookit.dto.ServiceRequestDto;
import com.dani.bookit.dto.ServiceResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Service;

public class ServiceMapper {

    public static Service toEntity(ServiceRequestDto dto, Business business){
        Service service = new Service();
        service.setName(dto.getName());
        service.setPrice(dto.getPrice());
        service.setDuration(dto.getDuration());
        service.setDescription(dto.getDescription());
        service.setBusiness(business);
        return service;
    }

    public static ServiceResponseDto toServiceResponse(Service service){
        ServiceResponseDto dto = new ServiceResponseDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setDuration(service.getDuration());
        dto.setPrice(service.getPrice());
        dto.setBusinessId(service.getBusiness().getId());
        dto.setBusinessName(service.getBusiness().getName());
        return dto;
    }

}
