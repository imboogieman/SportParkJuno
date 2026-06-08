Feature: Post-Match Checkout, Stats, and Truancy Enforcement
  As a host
  I want to verify attendance, log stats, and enforce truancy penalties
  So that player records and penalties remain consistent and fair

  Scenario: Host logs attendance and player stats
    Given the match has officially concluded
    When the host opens the post-match verification dashboard
    Then the host can toggle players as either present or absent
    And the host can log specific match statistics (e.g., goals) to update player profiles

  Scenario: Host enforces progressive penalties for truancy
    Given the host marks a player as absent without an approved late sign-off
    When the host finalizes the checkout sheet
    Then the system applies a 30-day Yellow Card warning to the player
    And if it is a second absence within 30 days, converts it to a Red Card with a 14-day ban

  Scenario: Interactive Post-Game Check-sheet Delivery
    Given the match has officially concluded
    When the system generates the post-match checkout sheet
    Then the admin receives a private interactive dashboard listing every player assigned to active team sheets
    And each player entry includes [ Present ] and [ Absent ] selection buttons

  Scenario: Stat logging updates leaderboards and profiles
    Given a player is marked Present on the checkout sheet
    When the admin opens the player's performance logging screen and logs a Goal count
    Then the system updates the player's profile statistics
    And the system updates the community leaderboard to reflect the new totals

  Scenario: Yellow Card Warning applied for unexcused absence
    Given the host marks a player as Absent without an approved late sign-off
    When the host finalizes the checkout sheet
    Then the system attaches a Yellow Card warning to the player's profile with a 30-day sliding expiry
    And the system displays a persistent yellow card emoji (🟨) next to the player's username on public match cards for 30 days
    And if the player maintains clean attendance for 30 consecutive days, the Yellow Card expires automatically

  Scenario: Red Card suspension on second unexcused absence within 30 days
    Given the player currently has an active Yellow Card warning
    And the player is marked Absent again for a separate match within the 30-day warning window
    When the host finalizes the checkout sheet for the second incident
    Then the system upgrades the player's penalty to a Red Card suspension
    And the system clears the Yellow Card warning strike(s)
    And the system applies an account-level ban preventing all match registrations for exactly 14 calendar days
    And the system denies any signup attempts from the suspended player until the ban expires
