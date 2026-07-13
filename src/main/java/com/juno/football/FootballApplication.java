package com.juno.football;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class FootballApplication {

	public static void main(String[] args) {
		SpringApplication.run(FootballApplication.class, args);
	}
}