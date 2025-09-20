@assign-pc @regression
Feature: Assign PC Functionality
  As a admin user
  I want to be able to Assign PC to Another User
  So that they can access it

  Background: Login to the application
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I enter valid email and password
    And I click the login button
    Then I should be logged in successfully
    And I should see the dashboard

 Scenario: Assign user to PC
    Given I am on the dashboard
    When I click on Sense PC from side navigation bar
    Then I should be on the Sense PCs page
    When I click on Build Sense PC button
    And I enter Name of the computer
    And I click on Estimate button
    And I click on Build PC button
    Then I should be able to verify Estimated total: "$1.109 /hour"
    When I check I acknowledge and accept above statement
    And I Click on Confirm & Pay button
    Then I should be able to verify Newly create PC Name Record on list
    When I wait for the PC to complete building and start running
    And I click on stop button for that PC
    And I click on Yes, Stop button
    Then I should be able to see newly created PC and its status as "Stopped"
    When I click on more button for that PC
    And I click on Assign User button for that PC
    Then I should be able to see "Assign SmartPC" modal
    And I should be able to verify Assign to Member displays "Doe"
    When I click on "Doe" user
    And I click on the newly created PC name
    And I click on assign user button
    Then I should be able to see "Doe" user is assigned to PC