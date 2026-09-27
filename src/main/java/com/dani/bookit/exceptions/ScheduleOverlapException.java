package com.dani.bookit.exceptions;

public class ScheduleOverlapException extends RuntimeException{
    public ScheduleOverlapException(String message){
        super(message);
    }
}
