@create-a-new-pc @regression
Feature: Create a new PC Functionality
  As a user
  I want to be able to Create a new PC to the application
  So that I can Use it

  Background: Login to the application
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I enter valid email and password
    And I click the login button
    Then I should be logged in successfully
    And I should see the dashboard

  @createANewPC-default-settings
  Scenario: Create a new PC with Default Settings For a new User
    Given I am on the dashboard
    When I click on Sense PC from side navigation bar
    Then I should be on the Sense PCs page
    When I click on Build Sense PC button
    And I enter Name of the computer
    And I click on Estimate button
    Then I should be able to verify CPU "$1.096"
    And I should be able to verify Storage "$0.013"
    And I should be able to verify Total "$1.109"
    When I click on Build PC button
    Then I should be able to verify Estimated total: "$1.109 /hour"
    When I check I acknowledge and accept above statement
    And I Click on Confirm & Pay button
    Then I should be able to verify Newly create PC Name Record on list
    When I click on more button for that PC
    Then I should be able to see Delete PC button
    When I click on delete button for that PC
    And I confirm delete PC
    Then I should be able to see PC deleted successfully message
    And I should be able to verify PC is not present in the list

 @createANewPC-connect-to-pc-and-disconnect @smoke
 Scenario: Create a new PC, Connect to the PC and Disconnect
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
  #  Then I should be able to verify "$1.109" amount deducted notification
   Then I should be able to verify Newly create PC Name Record on list
   When I wait for the PC to complete building and start running
   And I click on connect button when it is ready and clickable
   Then I should be able to verify PC is connected successfully
   Then I should be able to see newly created PC and its status as "CONNECTED"
   When I click on disconnect button for that PC
   When I click on more button for that PC
   Then I should be able to see Delete PC button
   When I click on delete button for that PC
   And I confirm delete PC
   Then I should be able to see PC deleted successfully message
   And I should be able to verify PC is not present in the list

  @createANewPC-resize-pc
  Scenario: Create a new PC, and Resize PC
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
    # Then I should be able to verify "$1.109" amount deducted notification
    Then I should be able to verify Newly create PC Name Record on list
    When I wait for the PC to complete building and start running
    And I click on stop button for that PC
    And I click on Yes, Stop button
    Then I should be able to see newly created PC and its status as "Stopped"
    When I click on more button for that PC
    When I click on resize button for that PC
    And I select new CPU and Memory configuration
    And I click on confirm resize button
    Then I should be able to verify resize submitted notification
    When I click on more button for that PC
    Then I should be able to see Delete PC button
    When I click on delete button for that PC
    And I confirm delete PC
    Then I should be able to see PC deleted successfully message
    And I should be able to verify PC is not present in the list