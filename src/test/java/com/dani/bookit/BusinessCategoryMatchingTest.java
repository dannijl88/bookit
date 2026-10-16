package com.dani.bookit;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.Role;
import com.dani.bookit.entities.User;
import com.dani.bookit.repositories.BusinessRepository;
import com.dani.bookit.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que el listado público encuentra los negocios sin importar que la
 * categoría esté guardada con o sin tilde.
 *
 * Es una prueba con base de datos real porque la normalización se hace dentro de
 * SQL (`translate(lower(...))`), que no se puede ejercitar con mocks: es
 * exactamente el fallo que dejaba la portada vacía en producción.
 */
@SpringBootTest(properties = {
		"spring.jpa.hibernate.ddl-auto=validate",
		"spring.flyway.enabled=true",
		"spring.flyway.baseline-on-migrate=true",
		"spring.flyway.baseline-version=1"
})
@Testcontainers
class BusinessCategoryMatchingTest {

	@Container
	@ServiceConnection
	static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

	@Autowired
	private BusinessRepository businessRepository;
	@Autowired
	private UserRepository userRepository;

	private User owner;

	@BeforeEach
	void setUp() {
		businessRepository.deleteAll();
		userRepository.deleteAll();
		owner = userRepository.save(new User(null, "Owner", "owner@cat.com", "secret", "600000000",
				Role.BUSINESS_OWNER));

		business("Peluqueria sin tilde", "peluqueria", true);
		business("Barberia con tilde", "Barbería", true);
		business("Spa exacto", "Spa", true);
		business("Peluqueria cerrada", "peluqueria", false);
	}

	@Test
	void findActiveByCategoryIgnoringAccents_matchesUnaccentedRowWithAccentedQuery() {
		// Este es el caso de producción: guardado como 'peluqueria', el frontend
		// pregunta por 'Peluquería'.
		List<String> names = names("Peluquería");

		assertThat(names).containsExactly("Peluqueria sin tilde");
	}

	@Test
	void findActiveByCategoryIgnoringAccents_matchesAccentedRowWithUnaccentedQuery() {
		assertThat(names("barberia")).containsExactly("Barberia con tilde");
	}

	@Test
	void findActiveByCategoryIgnoringAccents_keepsExactMatchesAndSkipsOtherCategories() {
		assertThat(names("Spa")).containsExactly("Spa exacto");
		assertThat(names("Estética")).isEmpty();
	}

	@Test
	void findActiveByCategoryIgnoringAccents_excludesInactiveBusinesses() {
		// 'Peluqueria cerrada' comparte categoría pero está desactivada.
		assertThat(names("Peluquería")).doesNotContain("Peluqueria cerrada");
	}

	private List<String> names(String category) {
		Page<Business> page = businessRepository.findActiveByCategoryIgnoringAccents(
				category, PageRequest.of(0, 10));
		return page.getContent().stream().map(Business::getName).toList();
	}

	private void business(String name, String category, boolean active) {
		businessRepository.save(new Business(null, name, "Calle Mayor 1", "910000000", category,
				"09:00-20:00", active, owner));
	}

}
