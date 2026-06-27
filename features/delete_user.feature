@regression @delete @users
Feature: DELETE user
  As an API consumer
  I want to delete a user
  So that obsolete records are removed

  @smoke
  Scenario: Delete an existing user
    When I delete the user with id 2
    Then the response status should be 200
    And the response body should be empty
