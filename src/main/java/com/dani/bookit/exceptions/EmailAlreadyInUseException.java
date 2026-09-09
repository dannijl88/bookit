package com.dani.bookit.exceptions;

public class EmailAlreadyInUseException extends RuntimeException{

    public EmailAlreadyInUseException(String message) {
        super(message);
    }

}
