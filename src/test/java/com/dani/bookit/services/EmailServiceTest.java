package com.dani.bookit.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void usesConfiguredFromAddress() {
        EmailService emailService = new EmailService(mailSender, "reservas@minegocio.com");

        emailService.sendEmail("cliente@example.com", "Cita creada", "Tu cita ha sido creada");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertThat(message.getFrom()).isEqualTo("reservas@minegocio.com");
        assertThat(message.getTo()).containsExactly("cliente@example.com");
        assertThat(message.getSubject()).isEqualTo("Cita creada");
        assertThat(message.getText()).isEqualTo("Tu cita ha sido creada");
    }
}
