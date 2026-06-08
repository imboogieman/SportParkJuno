Feature: Match Event Creation and Weather Interrogation
  As an event host
  I want the system to check weather risk during event creation
  So that unsafe matches are highlighted prior to publishing

  Scenario: Host creates an event with safe weather
    Given the host initiates the event creation workflow via Telegram DM or Web App
    And specifies the template, date, city, and match format
    When the system checks the external weather API for the specified location and time
    And the rain probability is under 20 percent
    Then the system finalizes the event creation
    And publishes the match card to the Telegram community and Web App schedule

  Scenario: Host creates an event with severe weather risks
    Given the host initiates the event creation workflow
    When the system detects humidity above 85 percent or rain intensity above 2.0 mm/hr
    Then the system applies a soft block interface
    And prompts the host with options to either proceed and publish anyway or abort generation
