package com.juno.football.model;

public class WeatherInfo {
    private double humidity;       // Влажность в % (например, 90.0)
    private double rainIntensity;  // Осадки в мм/час (например, 2.5)

    public WeatherInfo() {}

    public WeatherInfo(double humidity, double rainIntensity) {
        this.humidity = humidity;
        this.rainIntensity = rainIntensity;
    }

    public double getHumidity() { return humidity; }
    public void setHumidity(double humidity) { this.humidity = humidity; }
    public double getRainIntensity() { return rainIntensity; }
    public void setRainIntensity(double rainIntensity) { this.rainIntensity = rainIntensity; }
}
