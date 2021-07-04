package com.chuunpaan.core.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Seller {
    public enum EventType{ UPDATE, DISCONNECT }
    private String id;

    private EventType eventType;
    private double lat;
    private double lon;
    private double acc;
    private String name;
    private String message;
}
