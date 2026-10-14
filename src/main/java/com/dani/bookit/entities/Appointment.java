package com.dani.bookit.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "appointments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_employee_active_slot",
                columnNames = {"employee_id", "active_slot"}))
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private LocalDateTime appointmentDatetime;

    @Column(name = "active_slot", insertable = false, updatable = false,
            columnDefinition = "DATETIME GENERATED ALWAYS AS (CASE WHEN status <> 'CANCELLED' THEN appointment_datetime ELSE NULL END)")
    private LocalDateTime activeSlot;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceOffering serviceOffering;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

}
