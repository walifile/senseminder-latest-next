@login @regression
Feature: Login Functionality
  As a user
  I want to be able to log in to the application
  So that I can access my account

  @critical
  Scenario: I want to be able to log in to the application
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I enter valid email and password
    And I click the login button
    Then I should be logged in successfully
    And I should see the dashboard