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
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

# Usuario sin privilegios: el contenedor no necesita root para correr el jar.
RUN useradd --system --create-home --uid 1001 appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
