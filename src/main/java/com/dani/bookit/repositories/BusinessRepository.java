package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByOwner(User owner);
    List<Business> findByCategory(String category);

    /**
     * Negocios activos de una categoría, comparando sin distinguir mayúsculas
     * NI tildes.
     *
     * El frontend filtra por los valores canónicos de CATEGORIES ('Peluquería',
     * 'Barbería'...), así que cualquier fila guardada como 'peluqueria' dejaba de
     * coincidir porque `lower()` no normaliza tildes. `translate()` sí las quita,
     * de modo que las dos formas caen en la misma clave. Es una consulta nativa
     * porque `translate` no está en JPQL: sin `nativeQuery = true` Spring Data la
     * interpreta como HQL y falla al analizar `select *`.
     */
    @Query(value = """
            select *
            from business
            where active = true
              and translate(lower(category), 'áéíóúüñ', 'aeiouun')
                  = translate(lower(:category), 'áéíóúüñ', 'aeiouun')
            """, countQuery = """
            select count(*)
            from business
            where active = true
              and translate(lower(category), 'áéíóúüñ', 'aeiouun')
                  = translate(lower(:category), 'áéíóúüñ', 'aeiouun')
            """, nativeQuery = true)
    Page<Business> findActiveByCategoryIgnoringAccents(@Param("category") String category,
                                                       Pageable pageable);

}
