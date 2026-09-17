package com.dani.bookit.services;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Review;
import com.dani.bookit.entities.Status;
import com.dani.bookit.exceptions.AccessDeniedCustomException;
import com.dani.bookit.exceptions.InvalidAppointmentStatusException;
import com.dani.bookit.exceptions.ResourceAlreadyInUseException;
import com.dani.bookit.exceptions.ResourceNotFoundException;
import com.dani.bookit.mappers.ReviewMapper;
import com.dani.bookit.repositories.AppointmentRepository;
import com.dani.bookit.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;
    private final AppointmentRepository appointmentRepository;

    public ReviewResponseDto create(ReviewRequestDto dto, Long appointmentId, Long userId){

        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() ->
                new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        if (appointment.getStatus() != Status.COMPLETED){
            throw new InvalidAppointmentStatusException("Appointment status not completed");
        }
        if (repository.existsByAppointment(appointment)){
            throw new ResourceAlreadyInUseException("Review already exists in appointment with id: " + appointmentId);
        }
        if(!appointment.getClient().getId().equals(userId)){
            throw new AccessDeniedCustomException("You don't have permission");
        }
        Review newReview = ReviewMapper.toEntity(dto, appointment);
        repository.save(newReview);
        return ReviewMapper.toReviewResponse(newReview);
    }

}
