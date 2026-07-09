package com.juno.football.service;

import com.juno.football.model.WeatherInfo;
import org.springframework.stereotype.Service;

@Service
public class WeatherService {

    /**
     * Метод запрашивает погоду для Батуми.
     * Пока возвращаем жёстко прописанные данные (заглушку).
     * Позже мы заменим этот код на реальный HTTP-запрос к сайту погоды.
     */
    public WeatherInfo getWeatherForBatumi() {
        // Симулируем типичный дождливый вечер в Батуми: влажность 89%, дождь 2.5 мм/ч
        return new WeatherInfo(89.0, 2.5);
    }

    /**
     * Проверка: есть ли погодные риски для проведения футбола?
     * Возвращает true, если погода плохая (нужен Soft Block).
     */
    public boolean hasSevereWeatherRisks(WeatherInfo weather) {
        // Условия из технического задания:
        return weather.getHumidity() > 85.0 || weather.getRainIntensity() > 2.0;
    }
}
