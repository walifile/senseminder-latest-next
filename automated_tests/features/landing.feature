@landing @regression @ui
Feature: Landing page functionality
  As a user
  I want to be able to calculate cost and get started
  So that I can estimate the cost to build a pc & sign up

  Background: I am logged in as an admin user
    Given I am on the homepage

 Scenario: Get started button navigation
   Given I click on get started
   Then I should be on the sign up page

  Scenario: Calculate cost to build pc
    Given I scroll down to Choose configurations
    When I select operating system as "Windows 11"
    And I select cpu and memory as "Basic_win11_2core_4gbRam"
    And I select region as "US East (N. Virginia)"
    And I select storage as "120 GB"
    And I click on view estimate button
    Then I should be able to verify Est. Monthly "$78.72/month"
    And I should be able to verify Est. Daily "$2.62/day"
    And I should be able to verify Est. Hourly "$1.1093/hr"


