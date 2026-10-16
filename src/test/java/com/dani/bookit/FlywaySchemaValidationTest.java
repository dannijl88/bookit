package com.dani.bookit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que una base de datos vacía queda correctamente definida por las
 * migraciones de Flyway y que Hibernate en modo validate acepta ese esquema.
 *
 * El arranque del contexto ya implica que validate ha pasado; además comprobamos
 * que la V1 quedó registrada como aplicada y que las tablas existen.
 */
@SpringBootTest(properties = {
		"spring.jpa.hibernate.ddl-auto=validate",
		"spring.flyway.enabled=true",
		"spring.flyway.baseline-on-migrate=true",
		"spring.flyway.baseline-version=1"
})
@Testcontainers
class FlywaySchemaValidationTest {

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void flywayAppliesBaselineAndHibernateValidatesIt() {
		Integer appliedV1 = jdbcTemplate.queryForObject(
				"select count(*) from flyway_schema_history where version = '1' and success = true",
				Integer.class);
		assertThat(appliedV1).isEqualTo(1);

		Integer appliedV2 = jdbcTemplate.queryForObject(
				"select count(*) from flyway_schema_history where version = '2' and success = true",
				Integer.class);
		assertThat(appliedV2).isEqualTo(1);

		for (String table : new String[]{"appointments", "business", "employees",
				"employee_schedule", "reviews", "services", "time_off", "users"}) {
			Integer exists = jdbcTemplate.queryForObject(
					"select count(*) from information_schema.tables where table_name = ?",
					Integer.class, table);
			assertThat(exists).as("table %s should exist", table).isEqualTo(1);
		}
	}

}
