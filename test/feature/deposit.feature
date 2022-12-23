Feature: deposit

    User story - As a user, I want to deposit tokens into TermStructure

    Scenario: An L2 account will be registered when the user deposited for the first time
        Given The user doesn't have an L2 account
        When The user makes a deposit for 500 USDC
        Then An L2 account will be created 
        And The increase of L2 amount in USDC token leaf for user is 500
    
    Scenario: Normal deposit is accepted
        Given The user have an L2 account
        When The user makes a deposit for 200 USDC
        Then The deposit is accepted
        And The increase of L2 amount in USDC token leaf for user is 200