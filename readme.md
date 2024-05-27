Overview

This repository contains a Lambda function that integrates with AWS DynamoDB to generate and manage blockchain wallets. Additionally, it includes smart contracts for a tokenized asset and a stablecoin written in Clarity for the Stacks blockchain. The front end for this project is built using Bubble.io.

Table of Contents

- [Overview](#overview)
- [AWS Lambda Function](#aws-lambda-function)
- [DynamoDB Setup](#dynamodb-setup)
- [Lambda Layer](#lambda-layer)
- [Smart Contracts](#smart-contracts)
  - [Tokenized Asset](#tokenized-asset-smart-contract)
  - [Stablecoin](#stablecoin-smart-contract)
- [Frontend](#frontend)
- [Getting Started](#getting-started)
- [License](#license)

AWS Lambda Function

The Lambda function is designed to generate blockchain wallets, derive keys, and store wallet information in DynamoDB. Below is the core logic of the Lambda function.

Handler Function

LINK HERE

DynamoDB Setup

Create a DynamoDB table named StacksWalletData with the following schema:

    Primary Key: id (String)

Ensure you have the necessary permissions to read and write to this table.
Lambda Layer

Ensure the Lambda function has a layer that includes the necessary Node.js modules: aws-sdk, bitcoinjs-lib, bip39, tiny-secp256k1, @stacks/transactions.
Smart Contracts

This repository includes two smart contracts for managing a tokenized asset and a stablecoin.
Tokenized Asset Smart Contract [LINK]

Stablecoin Smart Contract [LINK]

Frontend

The frontend for this project is developed using Bubble.io. Bubble.io provides a visual interface to build web applications without needing to write code. It allows integration with various APIs and backend services, making it ideal for rapid development and deployment.
Getting Started

    Clone the repository:

    ```bash
    git clone https://github.com/your-repo/blockchain-wallet.git
    cd blockchain-wallet
    

    Deploy the Lambda Function:
        Ensure you have the AWS CLI configured.
        Package and deploy the Lambda function using AWS SAM or the Serverless Framework.

    Setup DynamoDB:
        Create a DynamoDB table named StacksWalletData.

    Deploy Smart Contracts:
        Deploy the provided smart contracts to the Stacks blockchain.

    Frontend Deployment:
        Use Bubble.io to create and deploy the frontend application.

For more detailed instructions on each step, please refer to the specific sections above.

License

This project is licensed under the MIT License.
# HackathonStacks
