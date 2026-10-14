package com.dani.bookit.events;

import com.dani.bookit.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationListener {

    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(EmailNotificationEvent event) {
        try {
            emailService.sendEmail(event.to(), event.subject(), event.body());
        } catch (Exception e) {
            log.error("Error sending email to {}", event.to(), e);
        }
    }
}
