@api-with-ui-auth @api @regression
Feature: API Testing with UI Authentication
  As a user
  I want to authenticate via UI and then use the captured token for API testing
  So that I can test API endpoints with real authentication tokens

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
    And I have the API base URL configured
    And I update API authentication with captured token

  @api-with-ui-auth-create
  Scenario: Create PC using captured UI authentication token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID

  @api-with-ui-auth-create-delete
  Scenario: Create PC, check status, and delete PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    And I should verify PC creation response contains custom system name
    And I prepare PC status check request for the created instance
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-create-status-delete
  Scenario: Create PC, check status, and delete PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    And I should verify PC creation response contains custom system name
    And I prepare PC status check request for the created instance
    When I send POST request to check PC status
    Then I should receive successful response with status code 200
    And I should verify PC status response contains valid status
    And I should verify PC status response contains instance ID
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-create-stop
  Scenario: Create PC and stop PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    When I wait for system status to be ok
    Then I should verify system status is ok
    And I prepare PC stop request for the created instance
    When I send POST request to stop PC
    Then I should receive successful response with status code 200
    And I should verify PC stop response contains success message
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-create-start-delete
  Scenario: Create PC, start PC, and delete PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    And I prepare PC start request for the created instance
    When I send POST request to start PC
    Then I should receive successful response with status code 200
    And I should verify PC start response contains success message
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-create-start-stop-delete
  Scenario: Create PC, start PC, stop PC, and delete PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    And I prepare PC start request for the created instance
    When I send POST request to start PC
    Then I should receive successful response with status code 200
    And I should verify PC start response contains success message
    When I wait for system status to be ok
    Then I should verify system status is ok
    And I prepare PC stop request for the created instance
    When I send POST request to stop PC
    Then I should receive successful response with status code 200
    And I should verify PC stop response contains success message
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-create-stop-custom-timeout
  Scenario: Create PC and stop PC with custom timeout using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    When I wait for system status to be ok with timeout 5 minutes
    Then I should verify system status is ok
    And I prepare PC stop request for the created instance
    When I send POST request to stop PC
    Then I should receive successful response with status code 200
    And I should verify PC stop response contains success message
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message

  @api-with-ui-auth-cognito-getuser
  Scenario: Get Cognito user information using captured token
    When I get Cognito user information using captured access token
    Then I should receive successful response with status code 200
    And I should verify Cognito user response contains user ID
    And I should verify Cognito user response contains user attributes

  @api-with-ui-auth-create-status-stop-status-resize-delete
  Scenario: Create PC, check status, stop PC, check status, resize PC, and delete PC using captured token
    Given I prepare PC creation request with basic configuration
    When I send POST request to create PC endpoint
    Then I should receive successful response with status code 200
    And I should verify PC creation response contains valid instance ID
    And I prepare PC status check request for the created instance
    When I send POST request to check PC status
    Then I should receive successful response with status code 200
    And I should verify PC status response contains valid status
    When I wait for system status to be ok
    Then I should verify system status is ok
    And I prepare PC stop request for the created instance
    When I send POST request to stop PC
    Then I should receive successful response with status code 200
    And I should verify PC stop response contains success message
    And I prepare PC status check request for the created instance
    When I send POST request to check PC status
    Then I should receive successful response with status code 200
    And I should verify PC status response contains valid status
    When I get Cognito user information using captured access token
    Then I should receive successful response with status code 200
    And I should verify Cognito user response contains user ID
    And I prepare PC resize request for the created instance with targetConfigId "Standerd_win11_4core_8gbRam" using dynamic userId
    When I send POST request to resize PC
    Then I should receive successful response with status code 200
    When I delete the created PC
    Then I should receive successful response with status code 200
    And I should verify PC deletion response contains success message
