@regression @get @users
Feature: GET users
  As an API consumer
  I want to retrieve users
  So that I can read existing records

  @smoke
  Scenario: Fetch a single existing user
    When I request the user with id 2
    Then the response status should be 200
    And the response should match the "single-user" schema
    And the user "name" should be "Ervin Howell"
    And the response time should be under 3000 ms

  Scenario: Fetch the list of users
    When I request the users list for page 1
    Then the response status should be 200
    And the response should match the "user-list" schema
    And the user list should contain 10 users

  Scenario: Requesting a non-existent user returns 404
    When I request the user with id 23
    Then the response status should be 404
