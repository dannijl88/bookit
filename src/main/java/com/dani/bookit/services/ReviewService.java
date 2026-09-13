package com.dani.bookit.services;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    public final ReviewRepository repository;

    public ReviewResponseDto create(ReviewRequestDto dto){

        

    }

}
