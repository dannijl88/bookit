package com.dani.bookit.exceptions;

public class AccessDeniedCustomException extends RuntimeException{
    public AccessDeniedCustomException(String message){
        super(message);
    }
}
