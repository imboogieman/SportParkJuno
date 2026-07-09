package com.juno.football.service;

import com.juno.football.model.EventType;
import com.juno.football.model.MatchEvent;
import com.juno.football.model.Player;
import com.juno.football.model.RegistrationStatus;
import com.juno.football.repository.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class MatchServiceTest {

    private MatchRepository matchRepository;
    private WeatherService weatherService;
    private MatchService matchService;
    private TelegramPushService telegramPushService;

    @BeforeEach
    void setUp() {
        // Создаём виртуальные "заглушки" (Mocks) вместо реальных объектов
        matchRepository = Mockito.mock(MatchRepository.class);
        weatherService = Mockito.mock(WeatherService.class);
        telegramPushService = Mockito.mock(TelegramPushService.class);

        // Передаём их в наш сервис
        matchService = new MatchService(matchRepository, weatherService, telegramPushService);
    }


    @Test
    void shouldAddPlayerToWaitlistWhenMatchIsFull() {
        // GIVEN (Дано из ТЗ: матч полностью заполнен, лимит 1 человек)
        Long matchId = 1L;
        MatchEvent fullMatch = new MatchEvent(
                matchId,
                EventType.FOOTBALL_ADULT,
                "MetroCity Mall Spot",
                LocalDateTime.now(),
                1, // maxCapacity = 1
                15.0
        );

        // Сажаем первого игрока, чтобы занять единственное место
        Player firstPlayer = new Player(111L, "Рома");
        fullMatch.getActiveRoster().add(firstPlayer);

        // Обучаем Mockito: когда сервис попросит найти матч с ID 1, верни наш заполненный матч
        when(matchRepository.findById(matchId)).thenReturn(Optional.of(fullMatch));

        // WHEN (Когда новый игрок пытается записаться на этот же матч)
        Player secondPlayer = new Player(222L, "Антон");
        RegistrationStatus resultStatus = matchService.registerPlayer(matchId, secondPlayer);

        // THEN (Тогда система должна вернуть статус WAITLIST)
        assertEquals(RegistrationStatus.WAITLIST, resultStatus, "Игрок должен был попасть в список ожидания!");
        assertEquals(1, fullMatch.getWaitlist().size(), "В списке ожидания должен быть ровно 1 человек!");
        assertEquals("Антон", fullMatch.getWaitlist().get(0).getName(), "В списке ожидания должен быть Антон!");
    }
}
