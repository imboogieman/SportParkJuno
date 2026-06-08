Feature: Telegram Bot Signup with One-Time Phone Verification
  As a Telegram user
  I want to sign up for an event through the Telegram bot using my handle after one-time phone verification
  So that signup is fast while spam protection remains enforced

  Scenario: New Telegram user verifies phone once and then signs up with handle
    Given a Telegram user clicks the event signup button in the announcement
    And the user is not yet linked to a verified profile
    When the bot requests one-time phone verification
    And the user completes successful phone verification
    Then the system creates a new profile linked to the user's Telegram ID and handle
    And the user is allowed to sign up for the event through the bot

  Scenario: Returning Telegram user signs up using Telegram handle only
    Given a Telegram user already has a verified profile linked to their Telegram ID
    When the user requests to sign up for a new event via the bot
    Then the system uses the existing linked profile
    And no phone verification is requested again
    And the signup is recorded against the event using the user's Telegram handle

  Scenario: Bot rejects signup when phone verification is declined
    Given a new Telegram user starts signup through the bot
    When the user declines or fails phone verification
    Then the bot does not create a verified profile
    And the user is told that verification is required to complete signup
