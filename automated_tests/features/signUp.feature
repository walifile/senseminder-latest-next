@signup @regression
Feature: Login Functionality
  As a user
  I want to be able to sign up to the application
  So that I can create my account

  @smoke @critical
  Scenario: I want to be able to sign up to the application
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I click the Sign up link
    Then I should be on the sign up page
    When I enter all the details
    And I click the sign up button
    Then I should be signed up successfully
    And I should be on verify email page
    When I enter OTP
    And I click the verify OTP button
    Then I should be able to verify email successfully
    And I should be on the login page

  @regression @extended
  Scenario: I want to be able to sign up to the application and then login with new credentials
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I click the Sign up link
    Then I should be on the sign up page
    When I enter all the details
    And I click the sign up button
    Then I should be signed up successfully
    And I should be on verify email page
    When I enter OTP
    And I click the verify OTP button
    Then I should be able to verify email successfully
    And I should be on the login page
    When I enter newly created email and password
    And I click the login button
    Then I should be logged in successfully
    And I should see the dashboard