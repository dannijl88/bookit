package com.dani.bookit.services;

import com.dani.bookit.dto.BusinessRequestDto;
import com.dani.bookit.dto.BusinessResponseDto;
import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.User;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.BusinessMapper;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository repository;
    private final UserRepository userRepository;

    @CacheEvict(value = "businesses", allEntries = true)
     public BusinessResponseDto create(BusinessRequestDto dto, Long ownerId){

         User user = userRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

         Business newBusiness = BusinessMapper.toEntity(dto, user);
         repository.save(newBusiness);
         return BusinessMapper.toResponseDto(newBusiness);
     }

     @Cacheable(value = "businesses", key = "#category + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
     public Page<BusinessResponseDto> findByCategory(String category, Pageable pageable){
         return repository.findByCategoryIgnoreCase(category, pageable).map(BusinessMapper::toResponseDto);
     }

}
