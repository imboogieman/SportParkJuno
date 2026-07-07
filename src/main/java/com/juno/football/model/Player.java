package com.juno.football.model;

public class Player {
    private Long telegramId;
    private String name;

    public Player() {}

    public Player(Long telegramId, String name) {
        this.telegramId = telegramId;
        this.name = name;
    }

    public Long getTelegramId() { return telegramId; }
    public void setTelegramId(Long telegramId) { this.telegramId = telegramId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
