@support @regression @ui
Feature: Support Functionality
  As an admin user
  I want to be able to create a support ticket, reply to it and mark it as resolved

  Background: I am logged in as an admin user
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
    When I setup API interception for login
    And I enter newly created email and password
    And I click the login button
    Then I should be logged in successfully
    And I capture the access token from login
    And I should see the dashboard
    And I navigate to the support page

  Scenario: Create support ticket, reply to it and mark it resolved
    Given I click on new ticket tab
    And I enter subject, description
    When I click on submit ticket button
    Then I should be able to see ticket in "Open" status
    When I click on the created ticket
    And I enter reply message
    And I click on send reply button
    Then I should be able to see added reply
    When I mark the ticket as resolved
    And I click on back to support
    Then I should be able to see ticket in "Resolved" status

