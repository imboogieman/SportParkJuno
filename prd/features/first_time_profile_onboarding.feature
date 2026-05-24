# User Story: US-01 — First-Time Profile Onboarding Wizard
# As a Player, I want a conversational onboarding wizard when I first interact with the bot
# so that I can accurately self-assess skill level and register preferred positions before joining games.

Feature: First-Time Profile Onboarding Wizard
  As a new player
  I want a guided conversational wizard to set my skill tier and positions
  So that match registration and automated drafting have correct player metadata

  Background:
    Given the system can cross-reference a player's unique account ID
    And public match signup actions can be paused

  Scenario: Trigger onboarding when first-time user clicks Sign Up
    Given the player has not registered a skill level and position in the central database
    When the player clicks the ⚽ Sign Up action button on a public match card
    Then the system pauses the public signup flow for that action
    And the system opens a private chat conversation with the player to run the onboarding wizard

  Scenario: Skill Assessment - select exactly one experience tier
    Given the onboarding wizard is active in the player's private chat
    When the bot asks the player to select their experience tier
    Then the bot displays an interactive button grid with exactly one choice required: Noob, Amateur, Semi-Pro, Pro
    And each option includes a short explanatory description to guide accurate self-evaluation
      "Noob: beginner, learning fundamentals"
      "Amateur: regular casual player, average stamina"
      "Semi-Pro: confident, competitive weekend league player"
      "Pro: elite/academy/pro-level skills"

  Scenario: Position Registration - require at least two positions
    Given the player has selected an experience tier
    When the bot displays the positions checkbox menu
    Then the player must select at least two positions from: GK, DF, MF, WG, FW
    And if the player attempts to submit fewer than two positions
    Then the bot returns a validation error prompting the player to select additional positions

  Scenario: Completion saves profile and resumes registration
    Given the player has selected a single experience tier and at least two positions
    When the player clicks Submit Profile
    Then the system saves the player's profile parameters to the central database
    And the onboarding wizard closes and redirects the player back to complete the original match registration
    And the system proceeds with the normal roster placement flow (active roster or waitlist) based on match capacity
