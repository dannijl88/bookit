package com.dani.bookit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponseDto {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer duration;
    private Long businessId;
    private String businessName;

}
