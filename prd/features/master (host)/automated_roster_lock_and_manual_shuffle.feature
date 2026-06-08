Feature: Automated Roster Lock and Manual Host/Admin Shuffle
  As a system and admin/host
  I want to auto-generate balanced teams and allow manual overrides
  So that teams are fair and admins can adjust rosters before they become public

  Background:
    Given an active match event is published
    And the system maintains an ordered active roster and Reserve List

  Scenario: System auto-generates balanced teams and sends private draft to Admin
    Given an active match event is exactly 60 minutes away from starting
    When the backend cron job triggers the roster lock
    Then the system splits the active roster into balanced teams respecting baseline skill coefficients
    And the system sends the draft lineup exclusively to the administrator's private DM as a draft preview

  Scenario: Admin uses interactive review controls (Swap Players)
    Given the admin is reviewing the private draft lineup in their admin review panel
    When the admin selects any two players from different squads and clicks Swap Players
    Then the system swaps the two players' team placements in the draft
    And the system preserves default player profile coefficients and other metadata
    And the draft preview updates in the admin review panel

  Scenario: Admin regenerates an alternate lineup (Regenerate Lineups)
    Given the admin is reviewing the private draft lineup
    When the admin clicks Regenerate Lineups
    Then the system wipes the current draft and runs an alternate randomized sorting iteration
    And the new draft still respects baseline skill boundaries and other constraints
    And the admin receives the new draft in their private DM for review

  Scenario: Admin broadcasts final rosters to public and players (Broadcast Rosters)
    Given the admin has approved the draft lineup in the admin review panel
    When the admin clicks Broadcast Rosters
    Then the system rewrites the pinned public match message in the Telegram group with clearly separated team headings and @handle mentions
    And the system triggers Next.js revalidation so the Web App schedule shows the official team split
    And the system sends an individual roster summary DM to each player with their assigned team color and kickoff location

  Scenario: Roster Lock Threshold and UI Freeze at 60 minutes
    Given an active match event has a scheduled kickoff time
    When the current time reaches exactly 60 minutes before kickoff
    Then the system locks public registration for the match
    And the system detaches or disables all signup and sign-off interactive controls from the public match card
    And any remaining reserve players remain in the Reserve List in standby state

  Scenario: Team splitting for 12 or fewer registered players
    Given the active roster contains 12 or fewer registered players at roster lock
    When the team-splitting algorithm runs
    Then the system divides players evenly into two teams named Yellow Squad and Blue Squad
    And the algorithm attempts to minimize total numeric skill variance between the two teams
    And the algorithm distributes goalkeepers and defensive anchors across squads to avoid positional stacking

  Scenario: Team splitting for more than 12 registered players
    Given the active roster contains more than 12 registered players at roster lock
    When the team-splitting algorithm runs
    Then the system divides players into three balanced teams named Yellow, Blue, and Red
    And the algorithm attempts to minimize total numeric skill variance across all three teams
    And the algorithm ensures positional dispersion so primary and secondary positions are balanced across squads

  Scenario: Team-splitting respects skill equilibrium and positional dispersion
    Given a set of signed-up players with mixed skill tiers and primary/secondary positions
    When the team-splitting engine computes squads
    Then the resulting teams balance numeric skill totals to minimize variance
    And the resulting teams ensure that no team has an excessive number of the same primary position (e.g., multiple goalkeepers)
    And the system flags any unavoidable positional conflicts to the admin in the draft preview

