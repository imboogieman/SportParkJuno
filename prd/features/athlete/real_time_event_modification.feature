Feature: Real-Time Event Modification and Management
  As a host or admin
  I want to modify event details and manage players in real time
  So that changes propagate immediately across platforms

  Scenario: Host modifies an active event parameter
    Given an active event is published across platforms
    When the host updates the location, description, or kickoff time via the admin dashboard
    Then the system dynamically updates the Telegram pinned message
    And triggers a Next.js revalidation to reflect changes instantly on the Web App

  Scenario: Host manually kicks or removes a player
    Given an active event with signed-up players
    When the host selects a player and forces a removal from the roster
    Then the system drops the player from the event
    And immediately shifts the waitlist up to fill the vacancy
