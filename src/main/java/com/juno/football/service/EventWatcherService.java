package com.juno.football.service;

import com.juno.football.model.MatchEvent;
import com.juno.football.repository.MatchRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventWatcherService {

    private final MatchRepository matchRepository;
    private final TelegramPushService telegramPushService;

    // Внедряем зависимости через конструктор, чтобы связать робота с базой и ботом
    public EventWatcherService(MatchRepository matchRepository, TelegramPushService telegramPushService) {
        this.matchRepository = matchRepository;
        this.telegramPushService = telegramPushService;
    }

    /**
     * Фоновый робот: опрашивает наш репозиторий каждые 5 секунд (5000 миллисекунд)
     */
    @Scheduled(fixedRate = 5000)
    public void fetchEventsFromFirebase() {
        // 1. Запрашиваем из базы список всех неопубликованных матчей
        List<MatchEvent> newMatches = matchRepository.findByIsPublishedFalse();

        if (!newMatches.isEmpty()) {
            System.out.println("Робот-наблюдатель: Обнаружено новых матчей для публикации: " + newMatches.size());

            for (MatchEvent match : newMatches) {
                try {
                    // 2. Даём команду боту выстрелить карточкой в Телеграм!
                    telegramPushService.sendEventAnnouncement(match);

                    // 3. Ставим отметку "Опубликовано", чтобы робот больше не спамил этим матчем
                    match.setPublished(true);
                    matchRepository.save(match);

                    System.out.println("Робот-наблюдатель: Матч с ID " + match.getId() + " успешно отправлен в ТГ!");
                } catch (Exception e) {
                    System.err.println("Робот-наблюдатель: Ошибка при авто-публикации: " + e.getMessage());
                }
            }
        }
    }
}