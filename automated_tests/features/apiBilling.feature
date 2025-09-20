@api-billing @regression @api
Feature: Billing API Automation
  As a user
  I want to be able to manage billing operations via API
  So that I can test billing functionality programmatically

   Background: UI Authentication and Token Capture
    Given I am on the homepage
    When I click the Sign in link
    Then I should be on the login page
    When I setup API interception for login
    When I enter valid email and password
    And I click the login button
    Then I should be logged in successfully
    And I capture the access token from login
    And I should see the dashboard
    And I have the billing API base URL configured
    And I update API authentication with captured token for billing

  @api-billing-payment-methods
  Scenario: Get payment methods for current user
    Given I prepare get payment methods request for current user
    When I send GET request to get payment methods endpoint
    Then I should receive successful billing response with status code 200
    And I should verify payment methods response contains payment methods

  @api-billing-set-default-card
  Scenario: Set default card for current user
    # Step 1: Get existing payment methods
    Given I prepare get payment methods request for current user
    When I send GET request to get payment methods endpoint
    Then I should receive successful billing response with status code 200
    And I should verify payment methods response contains payment methods
    
    # Step 2: Add new payment method
    Given I prepare add payment method request for current user
    When I send POST request to add payment method endpoint
    Then I should receive successful billing response with status code 200
    And I should verify add payment method response contains payment method ID
    
    # Step 3: Set the new payment method as default
    Given I prepare set default card request for current user
    When I send POST request to set default card endpoint
    Then I should receive successful billing response with status code 200
    And I should verify process refunds response contains success message
    
    # Step 4: Clean up - delete the added payment method
    Given I prepare delete payment method request for current user
    When I send DELETE request to delete payment method endpoint
    Then I should receive successful billing response with status code 200
    And I should verify delete payment method response contains success message

  @api-billing-get-recharges
  Scenario: Get recharge history for current user
    Given I prepare get recharges request for current user
    When I send GET request to get recharges endpoint
    Then I should receive successful billing response with status code 200
    And I should verify recharges response contains recharge data

  @api-billing-recharge-wallet
  Scenario: Recharge current user wallet
    Given I prepare recharge request for current user
    When I send POST request to recharge endpoint
    Then I should receive successful billing response with status code 200
    And I should verify recharge response contains success message
    And I should verify recharge response contains wallet balance

#   @api-billing-refund-request @smoke
#   Scenario: Create refund request for current user
#     Given I prepare refund request for current user
#     When I send POST request to create refund request endpoint
#     Then I should receive successful billing response with status code 200
#     And I should verify refund request response contains refund request ID

#   @api-billing-refund-requests @smoke
#   Scenario: Get refund requests
#     When I send GET request to get refund requests endpoint
#     Then I should receive successful billing response with status code 200
#     And I should verify refund requests response contains refund requests

#   @api-billing-process-refunds @smoke
#   Scenario: Process refunds
#     Given I prepare process refunds request with dynamic tickets
#     When I send POST request to process refunds endpoint
#     Then I should receive successful billing response with status code 200
#     And I should verify process refunds response contains success message

  @api-billing-integration @extended
  Scenario: Complete billing workflow for current user
    Given I prepare get payment methods request for current user
    When I send GET request to get payment methods endpoint
    Then I should receive successful billing response with status code 200
    And I should verify payment methods response contains payment methods
    
    Given I prepare recharge request for current user
    When I send POST request to recharge endpoint
    Then I should receive successful billing response with status code 200
    
    Given I prepare get recharges request for current user
    When I send GET request to get recharges endpoint
    Then I should receive successful billing response with status code 200
    And I should verify recharges response contains recharge data
