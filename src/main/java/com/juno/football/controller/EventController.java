package com.juno.football.controller;

import com.juno.football.model.MatchEvent;
import com.juno.football.model.Player;
import com.juno.football.model.RegistrationStatus;
import com.juno.football.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final MatchService matchService;

    public EventController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createMatch(@RequestBody MatchEvent matchEvent) {
        String result = matchService.createMatchWithWeatherCheck(matchEvent);
        if (result.startsWith("SOFT_BLOCK")) {
            return ResponseEntity.status(400).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create/force")
    public ResponseEntity<String> forceCreateMatch(@RequestBody MatchEvent matchEvent) {
        matchService.forceCreateMatch(matchEvent);
        return ResponseEntity.ok("SUCCESS: Матч принудительно создан вопреки плохой погоде!");
    }

    @PostMapping("/{matchId}/register")
    public ResponseEntity<String> registerPlayer(@PathVariable Long matchId, @RequestBody Player player) {
        RegistrationStatus status = matchService.registerPlayer(matchId, player);

        if (status == RegistrationStatus.ACTIVE) {
            return ResponseEntity.ok("SUCCESS: Игрок успешно добавлен в основной состав!");
        } else {
            return ResponseEntity.ok("WAITLIST: Свободных мест нет. Игрок добавлен в список ожидания!");
        }
    }
}
