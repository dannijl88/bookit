package com.dani.bookit.exceptions;

public class ResourceAlreadyInUseException extends RuntimeException{

    public ResourceAlreadyInUseException(String message) {
        super(message);
    }

}
