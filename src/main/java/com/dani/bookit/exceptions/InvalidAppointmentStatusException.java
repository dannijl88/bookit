package com.dani.bookit.exceptions;

public class InvalidAppointmentStatusException extends RuntimeException {
    public InvalidAppointmentStatusException(String message){
        super(message);
    }
}
