@billings @regression
Feature: Add Payment method, and Recharge Wallet for a new User
  As a user
  I want to be able to Add Payment method, and Recharge Wallet for a new User
  So that I can Use it

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

  Scenario: Add Payment method, and Recharge Wallet for a new User
    Given I am on the dashboard
    When I click on Wallet Balance on Top
    Then I should be on the Billing and Payments page
    And I should see Wallet Balance is "$0.00"
    When I click on Add Payment Method
#    And I enter Cardholder name
    And I enter Card number
    And I enter CVV
    And I enter Expiry
#    And I enter ZipCode
    And I click on Save Card Securely
    Then I should be able to verify Card added successfully
    When I close Add Payment Method Popup
    And I click on $20 from Quick Recharge
    And I check on Enable automatic reoccuring
    And I click on Yes, Recharge button
    Then I should see Wallet Balance is "$20.00"