# User Story: US-03 — Accountability Lockout & Early/Late Cancellations
# As a Player, I want the bot to manage cancellations fairly based on how
# close we are to kickoff so that the match organizer has enough time to
# find a replacement player.

Feature: Deadline Lockout and Cancellation Enforcement
  As a match participant
  I want cancellation rules enforced based on time before kickoff
  So that roster stability and penalties are applied correctly

  Background:
    Given a match has an official scheduled kickoff time
    And the system maintains an ordered Reserve List (priority waitlist) for the match

  Scenario: Player cancels more than 6 hours before kickoff (Early Sign-Off)
    Given the current time is more than 6 hours before the match scheduled start
    When the player clicks the Leave button
    Then the system removes the player from the active roster without penalty
    And the system promotes the first player on the Reserve List into the active roster
    And the system sends an instant direct message to the promoted player asking them to confirm their promotion
    And the system updates the roster UI across Telegram and Web App immediately

  Scenario: Player attempts to cancel less than 6 hours before kickoff (Late Sign-Off)
    Given the current time is less than 6 hours before the match scheduled start
    When the player views the match registration controls
    Then the standard self-service Leave button is locked or hidden
    And the player is shown a prominent warning describing the late-cancellation impact
    And the player is presented an alternative action: Leave & Incur Card

  Scenario: Player uses Leave & Incur Card within 6 hours (Late departure with penalty)
    Given the standard Leave action is locked because it is less than 6 hours before kickoff
    When the player clicks Leave & Incur Card
    Then the system issues an attendance strike against the player's profile
    And the system removes the player from the active roster
    And the system promotes the first player on the Reserve List into the active roster
    And the system sends an instant direct message to the promoted player asking them to confirm their promotion
    And the system updates the roster UI across Telegram and Web App immediately

