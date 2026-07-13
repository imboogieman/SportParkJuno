package com.juno.football.service;

import com.juno.football.model.MatchEvent;
import com.juno.football.model.Player;
import com.juno.football.model.RegistrationStatus;
import com.juno.football.model.WeatherInfo;
import com.juno.football.repository.MatchRepository;
import org.springframework.stereotype.Service;

@Service
public class MatchService {
    private final MatchRepository matchRepository;
    private final WeatherService weatherService;
    private final TelegramPushService telegramPushService;

    public MatchService(MatchRepository matchRepository, WeatherService weatherService, TelegramPushService telegramPushService) {
        this.matchRepository = matchRepository;
        this.weatherService = weatherService;
        this.telegramPushService = telegramPushService;
    }

    public String createMatchWithWeatherCheck(MatchEvent match) {
        WeatherInfo currentWeather = weatherService.getWeatherForBatumi();

        if (weatherService.hasSevereWeatherRisks(currentWeather)) {
            return "SOFT_BLOCK: Внимание! В Батуми высокая влажность (" + currentWeather.getHumidity()
                    + "%) или сильный дождь (" + currentWeather.getRainIntensity()
                    + " мм/ч). Вы уверены, что хотите опубликовать матч?";
        }

        matchRepository.save(match);

        return "SUCCESS: Матч успешно создан и опубликован в каналах Sport Park Batumi!";
    }

    public void forceCreateMatch(MatchEvent match) {
        matchRepository.save(match);

        telegramPushService.sendEventAnnouncement(match);
    }

    public RegistrationStatus registerPlayer(Long matchId, Player player) {
        MatchEvent match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Матч с ID " + matchId + " не найден"));

        if (match.getActiveRoster().contains(player)) return RegistrationStatus.ACTIVE;
        if (match.getWaitlist().contains(player)) return RegistrationStatus.WAITLIST;

        if (match.getActiveRoster().size() < match.getMaxCapacity()) {
            match.getActiveRoster().add(player);
            matchRepository.save(match);
            return RegistrationStatus.ACTIVE;
        } else {
            match.getWaitlist().add(player);
            matchRepository.save(match);
            return RegistrationStatus.WAITLIST;
        }
    }
}
