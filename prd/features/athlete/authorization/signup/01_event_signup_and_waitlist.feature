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

  Scenario: An active roster player signs off and triggers a waitlist promotion
    Given the match event capacity is completely full
    And Player A is on the active playing roster
    And Player B is first in the queue on the priority waitlist
    When Player A signs off from the match
    Then the system removes Player A from the active playing roster
    And the system automatically promotes Player B to the active playing roster
    And a "Next in Queue" update notification is sent to Player B via Telegram
    And the updated roster UI is synchronized across all platforms

  Scenario: Automatic roster lock and status notifications one hour before the match start
    Given a match event is scheduled to start in exactly one hour
    And the active playing roster is full
    And there are remaining players queueing on the waitlist
    When the system's one-hour pre-match trigger executes
    Then the match roster transitions to a "Locked" state
    And all players currently "In-Game" (on the active roster) receive a Telegram notification confirming their slot and match details
    And all players currently "Out" (remaining on the waitlist) receive a Telegram notification informing them that they did not make the cut for this match
    And further public sign-offs or registrations are disabled across all clients
