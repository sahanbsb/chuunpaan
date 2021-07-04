package com.chuunpaan.core.config;

import com.chuunpaan.core.models.Seller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SessionDisconnectListener {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @EventListener
    public void onApplicationEvent(SessionDisconnectEvent sessionDisconnectEvent) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(sessionDisconnectEvent.getMessage());
        if (sha.getSessionId() != null) {
            Seller seller = new Seller();
            seller.setId(sha.getSessionId());
            seller.setEventType(Seller.EventType.DISCONNECT);
            simpMessagingTemplate.convertAndSend("/topic/sellerLocations", seller);
        }
    }
}
