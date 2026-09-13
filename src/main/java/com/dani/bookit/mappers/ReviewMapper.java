package com.dani.bookit.mappers;

import com.dani.bookit.dto.ReviewRequestDto;
import com.dani.bookit.dto.ReviewResponseDto;
import com.dani.bookit.entities.Appointment;
import com.dani.bookit.entities.Review;

public class ReviewMapper {

    public static Review toEntity(ReviewRequestDto dto, Appointment appointment){

        Review review = new Review();
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setAppointment(appointment);
        return review;

    }

    public static ReviewResponseDto toReviewResponse(Review review){

        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setServiceName(review.getAppointment().getServiceOffering().getName());
        dto.setEmployeeName(review.getAppointment().getEmployee().getName());
        dto.setAppointmentId(review.getAppointment().getId());
        return dto;

    }

}
