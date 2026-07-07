--liquibase formatted sql

--changeset anton:1
CREATE TABLE matches (
                         id BIGINT NOT NULL,
                         event_type VARCHAR(50) NOT NULL,
                         location VARCHAR(255) NOT NULL,
                         date_time TIMESTAMP NOT NULL,
                         max_capacity INT NOT NULL,
                         price_gel NUMERIC(10, 2) NOT NULL,
                         CONSTRAINT pk_matches PRIMARY KEY (id)
);

--changeset anton:2
CREATE TABLE players (
                         telegram_id BIGINT NOT NULL,
                         name VARCHAR(150) NOT NULL,
                         match_id BIGINT,
                         status VARCHAR(50) NOT NULL,
                         CONSTRAINT pk_players PRIMARY KEY (telegram_id),
                         CONSTRAINT fk_player_match FOREIGN KEY (match_id) REFERENCES matches (id)
);