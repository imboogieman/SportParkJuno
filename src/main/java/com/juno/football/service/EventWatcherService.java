package com.juno.football.service;

import org.springframework.stereotype.Service;

@Service
public class EventWatcherService {

    /**
     * Служба будет опрашивать базу данных Firebase на наличие новых матчей
     */
    public void fetchEventsFromFirebase() {
        System.out.println("EventWatcher: Проверяем новые мероприятия в Firebase...");
    }
}
