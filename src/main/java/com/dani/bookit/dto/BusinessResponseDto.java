package com.dani.bookit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter
@AllArgsConstructor
@NoArgsConstructor
public class BusinessResponseDto {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private String category;
    private String openingHours;
    private Boolean active;
    private Long ownerId;
    private String ownerName;

}
