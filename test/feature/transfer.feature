Feature: transfer

    User story - As a user, I want to transfer tokens to others.

    Scenario: A transfer with enough balance and valid to L2Addr is accepted
        Given The L2 amount in USDC token leaf for user is 500
        When A user makes a transfer for 300 USDC to an existed account
        Then The transfer is accepted
        And The decrease of L2 amount in USDC token leaf for sender is 300
        And The increase of L2 amount in USDC token leaef for receiver is 300

    Scenario: A transfer to an unexisted account is rejected
        Given The L2 amount in USDC token leaf for user is 500
        When The user makes a transfer for 200 USDC to an unexisted account
        Then The transfer is rejected
    
    Scenario: A transfer without enough balance is rejected
        Given The L2 amount in USDC token leaf for user is 500
        When The user makes a transfer for 1000 USDC to an existed account
        Then The transfer is rejected