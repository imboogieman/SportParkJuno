Feature: Telegram Event Creation and Channel Publish
  As an event host
  I want my web-created event to publish to the Telegram channel and the web app
  So that participants see the same event details in both places

Scenario: Creating a new event with all the details
    Given the host is on the "Create New Event" page of the web app
    When the host fills in the following details:
      | Title       | Tech Networking Mixer 2026 |
      | Date & Time | June 15, 2026, 18:00 UTC   |
      | Location    | Innovation Hub, Room 404   |
      | Description | Connect with local tech enthusiasts and builders. |
      | Capacity    | 100 |
    And the host uploads two images (format: .jpg/png, max size: 5MB each)
    And the host submits the event form
    Then the event is successfully created with the attached media
    And the event preview displays both the banner and the thumbnail correctly
    Then the event should be successfully created

Scenario: A new event appears in the web app and Telegram channel
    Given the host has created a new event in the web app
    When the host marks the event for publication
    Then the event is saved to the database with a published status
    And the event appears in the web app event feed
    And an announcement is posted to the Telegram channel with event summary and signup guidance

Scenario: Saving an event as a template
    Given the host has filled in the details for a new event
    When the host selects the option to "Save as Template"
    And provides the template name "Standard Monthly Mixer"
    Then the template is saved to the host's profile
    And the host receives a confirmation message that the template was saved

Scenario: Selecting a template event
    Given the host is creating a new event
    When the host chooses to load from templates
    And selects the "Standard Monthly Mixer" template
    Then the event form fields are automatically populated with the template details
    And the host can review the pre-filled information before proceeding

Scenario: Edit details of an event
    Given a draft event named "Tech Networking Mixer 2026" exists
    And the host is on the event's edit page
    When the host updates the Location to "Grand Ballroom"
    And updates the Capacity to "150"
    And saves the changes
    Then the event details are updated in the database
    And the host sees the updated information on the event preview page   

Scenario: Attempting to publish an incomplete event prevents broadcast
    Given the host is on the event creation page
    When the host fills in the partial details
    And the host leaves the "Date & Time" and "Location" fields blank
    And the host attempts to publish the event
    Then the event is not saved to the database with a published status
    And the system displays a validation error highlighting the missing mandatory fields
    And no announcement is posted to the Telegram channel  

Scenario: Event cancellation updates the web app and Telegram channel simultaneously
    Given an event named "Tech Networking Mixer 2026" is currently published
    And the event announcement exists in the Telegram channel with an active signup link
    When the host selects "Cancel Event" in the web app dashboard
    And confirms the cancellation reason as "Venue issue"
    Then the event status in the database is updated to "Cancelled"
    And the event is marked as "Cancelled" in the web app event feed
    And the Telegram bot automatically edits the original channel announcement to prepending "[CANCELLED]" to the title
    And the Telegram signup button is disabled or replaced with an "Event Cancelled" notification
