package com.dani.bookit.events;

public record EmailNotificationEvent(String to, String subject, String body) {
}
