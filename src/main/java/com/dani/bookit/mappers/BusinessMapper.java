package com.dani.bookit.mappers;

import com.dani.bookit.dto.BusinessRequestDto;
import com.dani.bookit.dto.BusinessResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.User;

public class BusinessMapper {

    public static Business toEntity(BusinessRequestDto dto, User owner){

        Business business = new Business();
        business.setName(dto.getName());
        business.setPhone(dto.getPhone());
        business.setAddress(dto.getAddress());
        business.setCategory(dto.getCategory());
        business.setOpeningHours(dto.getOpeningHours());
        business.setOwner(owner);
        return business;

    }

    public static BusinessResponseDto toDto(Business business){

        BusinessResponseDto dto = new BusinessResponseDto();
        dto.setId(business.getId());
        dto.setName(business.getName());
        dto.setAddress(business.getAddress());
        dto.setCategory(business.getCategory());
        dto.setPhone(business.getPhone());
        dto.setOpeningHours(business.getOpeningHours());
        dto.setOwnerId(business.getOwner().getId());
        dto.setOwnerName(business.getOwner().getName());
        return dto;

    }

}
