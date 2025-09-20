@usermanagement @regression @ui
Feature: User Management
  As an admin user
  I want to be able to manage users in the system
  So that I can invite and manage user access to the platform

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
    And I navigate to the User Management page

  Scenario: Invite a new user as admin, user accepts the invitation and is onboarded
    Given I generate random user data for invitation
    And I click on the Invite User button
    When I enter the generated user name
    And I enter the generated user email
    And I select the user role "Admin"
    And I click on the Send Invitation button
    Then the user should appear in the user list with role "Admin"
    And the total user count should increase by 1
    When I accept the invitation as a new user
    And I login with the credentials provided in invitation mail
    And I create new password
    And I login with the new password created
    Then I should see the dashboard

  Scenario: Invite a new user as member, user accepts the invitation and is onboarded
    Given I generate random user data for invitation
    And I click on the Invite User button
    When I enter the generated user name
    And I enter the generated user email
    And I select the user role "Member"
    And I click on the Send Invitation button
    Then the user should appear in the user list with role "Member"
    And the total user count should increase by 1
    When I accept the invitation as a new user
    And I login with the credentials provided in invitation mail
    And I create new password
    And I login with the new password created
    Then I should see the dashboard

