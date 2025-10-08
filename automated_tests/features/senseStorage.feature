@sensestorage @regression @ui
Feature: Sense Storage
  As a user
  I want to be able to manage files in Sense Storage
  So that I can store, view, and share my files in the cloud

  Background: I want to be able to sign up to the application and then login with new credentials
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

  Scenario: Upload a single file successfully and View file in file viewer
    Given  I navigate to the Sense Storage page
    When I click on the Upload button
    And I upload a file "test-document.pdf" with size less than 10MB
    Then I should be able to see the file in the file list
    And I dismiss any feedback popup
    When I click on menu of the file "test-document.pdf" in the file list
    And I click on view button in the menu
    Then The file viewer should open with title containing "Preview: test-document.pdf"
    And I should see the file content displayed for "test-document.pdf"
    And I should be able to close the file viewer for "test-document.pdf"

  Scenario: Upload multiple files in bulk and delete multiple files in bulk
    Given  I navigate to the Sense Storage page
    When I click on the Upload button
    And I upload multiple files "test-document.pdf, test-document.docx, image.png" with total size less than 10MB
    Then All files should appear in the file list
    And I dismiss any feedback popup
    When I select the uploaded files "test-document.pdf, test-document.docx, image.png"
    And I click on the menu at the top right corner
    And I click on deleted selected button
    And I click on confirm delete button
    Then The selected files "test-document.pdf, test-document.docx, image.png" should not appear in the file list

  Scenario: Share file with another account
    Given  I navigate to the Sense Storage page
    When I click on the Upload button
    And I upload a file "test-document.pdf" with size less than 10MB
    Then I should be able to see the file in the file list
    And I dismiss any feedback popup
    When I click on menu of the file "test-document.pdf" in the file list
    And I click on the share button for file "test-document.pdf"
    Then The share modal should open with title containing "Share test-document.pdf"
    When I click on the share button
    And I click on close button
    Then I should see the status of "test-document.pdf" is set to "Shared"
