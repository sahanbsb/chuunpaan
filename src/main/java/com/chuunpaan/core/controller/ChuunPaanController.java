package com.chuunpaan.core.controller;

import com.chuunpaan.core.models.Seller;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChuunPaanController {

    @MessageMapping("/sellerLocation")
    @SendTo("/topic/sellerLocations")
    public Seller updateSellerLocation(Seller seller, StompHeaderAccessor stompHeaderAccessor) {
        seller.setId((String) stompHeaderAccessor.getHeader("simpSessionId"));
        seller.setEventType(Seller.EventType.UPDATE);
        return seller;
    }
}
