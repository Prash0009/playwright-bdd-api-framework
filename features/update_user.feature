@regression @put @users
Feature: PUT update user
  As an API consumer
  I want to update an existing user
  So that records stay current

  @smoke
  Scenario: Update a user using JSON test data
    When I update the user with id 2 using the "update" payload
    Then the response status should be 200
    And the response should match the "update-user" schema
    And the updated user should echo the job from the "update" payload
    And the response field "id" should be present
