Feature: Public Sign-Up Validation and Waitlist Routing
  As a player registering for a match
  I want the system to add me to the roster or waitlist depending on capacity
  So that roster management stays consistent across clients

  Scenario: A player signs up when the match is under capacity
    Given the match event has open slots
    When a player registers for the match via any client
    Then the central API adds the player to the active playing roster
    And immediately synchronizes the updated roster UI across the Telegram group and Next.js Web App

  Scenario: A player signs up when the match is full
    Given the match event capacity is completely full
    When a player registers for the match
    Then the system assigns the player to the priority waitlist
    And visually updates the waitlist placement across all platforms
