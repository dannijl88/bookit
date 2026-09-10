package com.dani.bookit.repositories;

import com.dani.bookit.entities.Business;
import com.dani.bookit.entities.ServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {

    List<ServiceOffering> findByBusiness(Business business);

}
