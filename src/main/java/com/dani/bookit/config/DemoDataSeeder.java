package com.dani.bookit.config;

import com.dani.bookit.entities.*;
import com.dani.bookit.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// Carga datos de demostración para que la app no arranque vacía en el despliegue.
// Sólo se activa con DEMO_SEED=true y es idempotente: si el usuario demo ya existe,
// no vuelve a insertar nada (se puede arrancar/reiniciar sin duplicar datos).
@Component
@ConditionalOnProperty(prefix = "app", name = "demo-seed", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements ApplicationRunner {

    private static final String OWNER_EMAIL = "owner@demo.com";
    private static final String CLIENT_EMAIL = "client@demo.com";
    private static final String DEMO_PASSWORD = "demo1234";

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeScheduleRepository scheduleRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(OWNER_EMAIL)) {
            log.info("Demo seed omitido: los datos de demostración ya existen.");
            return;
        }

        User owner = userRepository.save(new User(null, "Propietaria Demo", OWNER_EMAIL,
                passwordEncoder.encode(DEMO_PASSWORD), "600111222", Role.BUSINESS_OWNER));
        User client = userRepository.save(new User(null, "Cliente Demo", CLIENT_EMAIL,
                passwordEncoder.encode(DEMO_PASSWORD), "600333444", Role.CLIENT));

        Business business = businessRepository.save(new Business(null, "Peluquería Demo",
                "Calle Mayor 1, Madrid", "910000000", "peluqueria", "09:00-20:00", true, owner));

        Employee ana = employeeRepository.save(new Employee(null, "Ana", true, business, null));
        Employee luis = employeeRepository.save(new Employee(null, "Luis", true, business, null));

        for (Employee employee : List.of(ana, luis)) {
            for (DayOfWeek day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
                scheduleRepository.save(new EmployeeSchedule(null, day,
                        LocalTime.of(9, 0), LocalTime.of(17, 0), employee));
            }
        }

        ServiceOffering corte = serviceOfferingRepository.save(new ServiceOffering(null, "Corte de pelo",
                "Corte clásico con lavado", 15.0, 30, true, business));
        ServiceOffering tinte = serviceOfferingRepository.save(new ServiceOffering(null, "Tinte",
                "Coloración completa", 40.0, 60, true, business));
        serviceOfferingRepository.save(new ServiceOffering(null, "Peinado",
                "Peinado para eventos", 20.0, 45, true, business));

        appointmentRepository.save(new Appointment(null, LocalDate.now().plusDays(1).atTime(10, 0),
                null, Status.CONFIRMED, client, corte, ana));
        Appointment past = appointmentRepository.save(new Appointment(null,
                LocalDate.now().minusDays(7).atTime(11, 0), null, Status.COMPLETED, client, tinte, luis));

        reviewRepository.save(new Review(null, 5, "Todo perfecto, repetiré.", past));

        log.info("Demo seed creado. Usuarios: {} (propietaria) y {} (cliente), contraseña {}",
                OWNER_EMAIL, CLIENT_EMAIL, DEMO_PASSWORD);
    }
}
