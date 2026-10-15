# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM eclipse-temurin:25-jdk-noble AS build
WORKDIR /app

# Copiamos primero el wrapper y el POM para cachear la descarga de dependencias
# en una capa que sólo se invalida cuando cambian las dependencias.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q clean package -DskipTests

# ---------- Runtime ----------
# Alpine mantiene la imagen final pequeña (~100 MB frente a ~300 MB de una basada en Ubuntu).
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Usuario sin privilegios: el contenedor no necesita root para correr el jar.
RUN addgroup -S appuser && adduser -S -G appuser -u 1001 appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser

# Render inyecta el puerto por la variable PORT (application.properties: server.port=${PORT:8080}).
EXPOSE 8080

# Ajustes pensados para el plan free de Render (512 MB / 0.1 CPU):
#  -XX:MaxRAMPercentage=75  -> heap ≈75% del límite del contenedor (~384 MB) sin hardcodear -Xmx
#  -XX:+UseSerialGC          -> GC de un solo hilo: menos overhead con sólo 0.1 CPU
#  -XX:TieredStopAtLevel=1   -> menos compilación JIT a cambio de arrancar antes
#  -Djava.security.egd=...   -> evita bloqueos por falta de entropía en contenedores pequeños
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
