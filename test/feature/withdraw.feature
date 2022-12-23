Feature: withdraw

    User story - As a user, I want to withdraw tokens to L1.

    Scenario: A withdraw with enough balance is accepted
        Given The L2 amount in USDC token leaf for user is 500
        When A user makes a withdraw for 300 USDC
        Then The withdraw is accepted
        And The decrease of L2 amount in USDC token leaf for user is 300
        And The increase of L2 burnAccount of USDC for user is 300
        And The increase of L1 pendingWithdrawBalance of USDC for user is 300

    Scenario: A withdraw exceeds the total balance is rejected
        Given The L2 amount in USDC token leaf for user is 500
        When The user makes a withdraw for 1000 USDC
        Then The withdraw is rejected