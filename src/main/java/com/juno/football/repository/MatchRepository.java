package com.juno.football.repository;

import com.juno.football.model.MatchEvent;
import org.springframework.stereotype.Repository;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class MatchRepository {
    private final Map<Long, MatchEvent> storage = new ConcurrentHashMap<>();

    public MatchEvent save(MatchEvent matchEvent) {
        storage.put(matchEvent.getId(), matchEvent);
        return matchEvent;
    }

    public Optional<MatchEvent> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    public void deleteById(Long id) {
        storage.remove(id);
    }
}
