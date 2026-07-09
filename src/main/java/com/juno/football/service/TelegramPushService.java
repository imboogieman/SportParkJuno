package com.juno.football.service;

import com.juno.football.model.MatchEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TelegramPushService {

    private final String botToken = "8596634492:AAFsAHlhRT5bkOP1jJUmKkPACAKvU4TnTGw";
    private final String chatId = "-1004366703289";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEventAnnouncement(MatchEvent event) {
        String rawText = "⚽ *СПОРТ ПАРК: АНОНС МАТЧА* ⚽\n\n" +
                "📍 *Локация:* " + event.getLocation() + "\n" +
                "👥 *Лимит мест:* " + event.getMaxCapacity() + " игроков\n" +
                "💰 *Цена:* " + event.getPriceGel() + " GEL\n\n" +
                "👇 Записывайтесь на игру через кнопки ниже:";

        try {
            // 1. Кодируем русский текст, чтобы не ломались пробелы и переносы
            String encodedText = java.net.URLEncoder.encode(rawText, "UTF-8");

            // Наш JSON кнопок
            String inlineKeyboardJson = "{\"inline_keyboard\":[[{\"text\":\"✅ Приду (Вход)\",\"callback_data\":\"join_match\"},{\"text\":\"❌ Не смогу (Выход)\",\"callback_data\":\"leave_match\"}]]}";

            // 2. Кодируем JSON кнопок, чтобы убрать ошибку Illegal character из-за скобок и кавычек
            String encodedButtons = java.net.URLEncoder.encode(inlineKeyboardJson, "UTF-8");

            // 3. ТВОЙ ВЕРНЫЙ АДРЕС ЦЕЛИКОМ (с добавлением закодированных кнопок на конце):
            String url = "https://api.telegram.org/bot8596634492:AAFsAHlhRT5bkOP1jJUmKkPACAKvU4TnTGw/sendMessage?chat_id=-1004366703289&text="
                    + encodedText + "&parse_mode=Markdown&reply_markup=" + encodedButtons;

            // 4. Оборачиваем в URI для защиты парсинга Спринга
            java.net.URI uri = new java.net.URI(url);

            // 5. Выстреливаем запрос в Telegram
            String response = restTemplate.getForObject(uri, String.class);
            System.out.println("🔥 УСПЕХ! Ответ от серверов Telegram: " + response);

        } catch (Exception e) {
            System.err.println("Ошибка пуша карточки в группу: " + e.getMessage());
        }
    }
}
