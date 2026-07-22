package com.juno.football.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MatchEvent {
    private Long id;
    private EventType eventType;
    private String location;
    private LocalDateTime dateTime;
    private int maxCapacity;
    private double priceGel;
    private boolean isPublished = false;

    private List<Player> activeRoster = new ArrayList<>();
    private List<Player> waitlist = new ArrayList<>();

    public MatchEvent() {}

    public MatchEvent(Long id, EventType eventType, String location, LocalDateTime dateTime, int maxCapacity, double priceGel) {
        this.id = id;
        this.eventType = eventType;
        this.location = location;
        this.dateTime = dateTime;
        this.maxCapacity = maxCapacity;
        this.priceGel = priceGel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
    public double getPriceGel() { return priceGel; }
    public void setPriceGel(double priceGel) { this.priceGel = priceGel; }
    public List<Player> getActiveRoster() { return activeRoster; }
    public void setActiveRoster(List<Player> activeRoster) { this.activeRoster = activeRoster; }
    public List<Player> getWaitlist() { return waitlist; }
    public void setWaitlist(List<Player> waitlist) { this.waitlist = waitlist; }
    public boolean isPublished() { return isPublished; }
    public void setPublished(boolean published) { isPublished = published; }
}
