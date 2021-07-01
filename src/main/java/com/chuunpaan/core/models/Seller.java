package com.chuunpaan.core.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Seller {
    private String id;

    private double lat;
    private double lon;
    private double acc;
    private String name;
    private String message;
}
