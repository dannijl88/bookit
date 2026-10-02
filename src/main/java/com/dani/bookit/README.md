# Slotlyfy

Backend de una plataforma SaaS de reservas multi-negocio (tipo Booksy), construida con Spring Boot. Permite a negocios de servicios (peluquerías, barberías, spas, clínicas de terapia, etc.) gestionar empleados, horarios y servicios, mientras los clientes buscan disponibilidad real y reservan citas online.

Proyecto personal construido para practicar y demostrar un nivel de backend más allá de un CRUD básico: seguridad real con JWT y control de acceso por rol/propiedad, un algoritmo de disponibilidad horaria calculado desde cero, caché con invalidación, y notificaciones por email.

> ⚠️ Proyecto en desarrollo activo. El backend está funcionalmente completo en su flujo principal (negocios, empleados, servicios, horarios, disponibilidad, reservas, reseñas); quedan pendientes algunas operaciones de edición/borrado menores, tests automatizados, documentación OpenAPI y el frontend.

---

## Índice

- [Qué hace la app](#qué-hace-la-app)
- [Stack técnico](#stack-técnico)
- [Decisiones técnicas destacadas](#decisiones-técnicas-destacadas)
- [Modelo de datos](#modelo-de-datos)
- [Seguridad](#seguridad)
- [Cómo levantarlo en local](#cómo-levantarlo-en-local)
- [Endpoints principales](#endpoints-principales)
- [Roadmap / pendiente](#roadmap--pendiente)
- [Autor](#autor)

---

## Qué hace la app

Slotlyfy conecta dos tipos de usuario:

- **Dueños de negocio (`BUSINESS_OWNER`)**: crean su negocio, dan de alta empleados con su horario semanal, publican los servicios que ofrecen (con duración y precio), gestionan las citas que les llegan y pueden consultar las reseñas que reciben.
- **Clientes (`CLIENT`)**: buscan negocios por categoría, consultan los servicios y la disponibilidad real de cada empleado para una fecha concreta, reservan, cancelan sus propias citas y dejan una reseña una vez completado el servicio.

El corazón del proyecto es el **cálculo de disponibilidad**: a partir del horario semanal de un empleado, la duración del servicio elegido y las citas ya existentes ese día, el sistema genera en tiempo real los huecos libres reales — no son horas fijas predefinidas, se calculan dinámicamente.

## Stack técnico

- **Java 25**
- **Spring Boot** (Spring Web, Spring Data JPA, Spring Security, Spring Cache, Spring Mail)
- **MySQL** como base de datos relacional
- **JWT** (JJWT) para autenticación stateless
- **Lombok** para reducir boilerplate
- **Jakarta Bean Validation** para validación de DTOs
- **Mailtrap** (SMTP sandbox) para notificaciones por email en desarrollo
- **Maven** como gestor de dependencias

## Decisiones técnicas destacadas

Algunas partes del proyecto en las que creo que vale la pena fijarse:

- **Algoritmo de disponibilidad horaria** (`AvailabilityService`): combina el horario semanal del empleado (`EmployeeSchedule`), la duración del servicio elegido y las citas ya reservadas ese día para generar los huecos libres reales, detectando solapes con la fórmula clásica de intervalos (`A.start < B.end && B.start < A.end`).

- **Seguridad en dos capas**: `@PreAuthorize` a nivel de rol (`BUSINESS_OWNER`, `CLIENT`) combinado con comprobaciones explícitas de *ownership* dentro de cada service (por ejemplo, que el negocio del recurso que se quiere modificar pertenezca realmente al usuario autenticado, o que una cita sea del cliente que intenta cancelarla). El rol por sí solo nunca es suficiente para autorizar una acción sobre un recurso ajeno.

- **Borrado lógico (*soft delete*)** mediante un campo `active` en las entidades que tienen historial asociado (`Employee`, `ServiceOffering`), en vez de `DELETE` físico — evita romper la integridad referencial con citas y reseñas pasadas, y permite reactivar un recurso sin pérdida de datos. Para entidades sin historial dependiente (`EmployeeSchedule`) se usa borrado físico normal.

- **Validación de solapes de horario**: al crear un tramo horario para un empleado, se comprueba contra los tramos ya existentes ese mismo día para evitar horarios contradictorios (p. ej. dos turnos que se pisan).

- **Caché con invalidación activa**: los listados paginados de negocios y citas usan `@Cacheable`; cualquier operación que modifique esos datos (crear, cambiar estado, cancelar) invalida la caché correspondiente con `@CacheEvict`, para no servir datos desactualizados.

- **Resiliencia en el envío de emails**: el envío de notificaciones está envuelto para que un fallo del proveedor de correo (caído, mal configurado, etc.) nunca haga fallar la operación de negocio principal (crear o cancelar una cita).

## Modelo de datos

Seis entidades principales y sus relaciones:

```
User (CLIENT / BUSINESS_OWNER)
 └── Business (1:N, vía owner)
      ├── Employee (1:N)
      │    └── EmployeeSchedule (1:N) — horario semanal por día
      ├── ServiceOffering (1:N) — duración y precio
      └── Appointment (vía Employee)
           ├── client: User
           ├── serviceOffering: ServiceOffering
           └── Review (1:1) — solo sobre citas COMPLETED
```

## Seguridad

- Autenticación mediante JWT (login devuelve un token con el rol del usuario embebido).
- Autorización por rol con `@PreAuthorize` en los endpoints que lo requieren.
- Autorización por propiedad (*ownership*) a nivel de service: un `BUSINESS_OWNER` solo puede gestionar recursos de negocios que le pertenecen a él; un `CLIENT` solo puede ver/cancelar sus propias citas.
- Endpoints de lectura pública (listado de negocios, servicios, empleados, reseñas y disponibilidad) no requieren autenticación, ya que cualquier visitante debe poder explorar el catálogo antes de registrarse.

## Cómo levantarlo en local

1. Clona el repositorio.
2. Crea una base de datos MySQL vacía.
3. Configura `src/main/resources/application.properties` con tus credenciales de BD y de SMTP (Mailtrap u otro):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/slotlyfy
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update

spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=TU_USUARIO_MAILTRAP
spring.mail.password=TU_PASSWORD_MAILTRAP
```

4. Ejecuta la aplicación:

```bash
mvn spring-boot:run
```

5. La API queda disponible en `http://localhost:8080`.

## Endpoints principales

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/users` | Registro de cliente | Público |
| POST | `/api/auth/login` | Login, devuelve JWT | Público |
| POST | `/api/businesses` | Crear negocio | `BUSINESS_OWNER` |
| GET | `/api/businesses?category=` | Listar negocios por categoría (paginado) | Público |
| GET | `/api/businesses/{id}/services` | Servicios de un negocio | Público |
| GET | `/api/businesses/{id}/employees` | Empleados activos de un negocio | Público |
| GET | `/api/businesses/{id}/reviews` | Reseñas de un negocio (paginado) | Público |
| GET | `/api/availability?employeeId=&serviceOfferingId=&date=` | Huecos libres reales | Público |
| POST | `/api/appointments` | Reservar cita (valida disponibilidad) | `CLIENT` |
| GET | `/api/appointments/me` | Mis citas (paginado) | `CLIENT` |
| PATCH | `/api/appointments/{id}/cancel` | Cancelar mi cita | `CLIENT` |
| GET | `/api/businesses/{id}/appointments` | Citas del negocio (paginado) | `BUSINESS_OWNER` |
| PATCH | `/api/appointments/{id}/status` | Cambiar estado de una cita | `BUSINESS_OWNER` |
| POST | `/api/reviews?appointmentId=` | Dejar reseña (solo citas `COMPLETED`) | `CLIENT` |

## Roadmap / pendiente

- [ ] UPDATE y DELETE en `Business`
- [ ] DELETE de reseñas por parte del cliente
- [ ] Tests automatizados (unitarios e integración)
- [ ] Documentación OpenAPI / Swagger
- [ ] Configuración de CORS para frontend
- [ ] Frontend de demostración
- [ ] Despliegue (Docker + servidor)

Fuera de alcance por ahora: integración de pagos reales — pendiente de decidir si el proyecto evoluciona hacia un lanzamiento real.

## Autor

**Dani Juan** — desarrollador web en transición hacia backend/fullstack.
Portfolio: [danijuan.com](https://danijuan.com)
GitHub: [github.com/dannijl88](https://github.com/dannijl88)
