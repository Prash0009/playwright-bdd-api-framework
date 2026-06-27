@regression @post @users
Feature: POST create user
  As an API consumer
  I want to create users
  So that new records exist on the server

  @smoke
  Scenario: Create a user from JSON test data
    When I create a user using the "create" payload
    Then the response status should be 201
    And the response should match the "create-user" schema
    And the created user should echo the name from the "create" payload
    And the response field "id" should be present

  Scenario Outline: Create users with multiple names (data-driven)
    When I create a user with name "<name>" and job "<job>"
    Then the response status should be 201
    And the created user should echo the name "<name>"

    Examples:
      | name     | job             |
      | neo      | the one         |
      | trinity  | hacker          |
      | morpheus | captain         |
