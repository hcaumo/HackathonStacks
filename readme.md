# HackathonStacks

### Overview

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

## AWS Lambda Function

The Lambda function is designed to generate blockchain wallets, derive keys, and store wallet information in DynamoDB. Below is the core logic of the Lambda function.

### Handler Function

```
import AWS from 'aws-sdk';
import { generateWallet } from '@stacks/wallet-sdk';
import bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'WalletData'; // Name of your DynamoDB table
const mnemonic = "truly panel jacket jaguar alert state casual busy buzz giggle quit example close resemble chief employ debate increase dress digital actress purity quiz fox";
const baseDerivationPath = `m/44'/0'/0'/0/`; // BIP44 for Bitcoin

export const handler = async (event) => {
    try {
        let lastIndex = await getLastIndex();
        const newPath = baseDerivationPath + lastIndex;

        const stacksWallet = await generateWallet({ secretKey: mnemonic, password: '' });
        const stacksAddress = stacksWallet.accounts[0].address;

        const seed = await bip39.mnemonicToSeed(mnemonic);
        const bitcoinRoot = bitcoin.bip32.fromSeed(seed);
        const bitcoinChild = bitcoinRoot.derivePath(newPath);
        const { address: bitcoinAddress } = bitcoin.payments.p2pkh({ pubkey: bitcoinChild.publicKey });

        await storeWalletData(stacksAddress, bitcoinAddress);
        await updateLastIndex(lastIndex + 1);

        const response = {
            statusCode: 200,
            body: JSON.stringify({ stacksAddress, bitcoinAddress }),
        };
        return response;
    } catch (error) {
        const response = {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
        return response;
    }
};

async function getLastIndex() {
    const params = {
        TableName: tableName,
        Key: { 'id': 'index' }
    };

    const data = await dynamoDb.get(params).promise();
    return data.Item ? data.Item.lastIndex : 0;
}

async function updateLastIndex(newIndex) {
    const params = {
        TableName: tableName,
        Key: { 'id': 'index' },
        UpdateExpression: 'set lastIndex = :i',
        ExpressionAttributeValues: {
            ':i': newIndex
        }
    };

    await dynamoDb.update(params).promise();
}

async function storeWalletData(stacksAddress, bitcoinAddress) {
    const params = {
        TableName: tableName,
        Item: {
            'id': stacksAddress, // Using Stacks address as the ID for simplicity
            'stacksAddress': stacksAddress,
            'bitcoinAddress': bitcoinAddress
        }
    };

    await dynamoDb.put(params).promise();
}

```

### DynamoDB Setup

Create a DynamoDB table named StacksWalletData with the following schema:

    Primary Key: id (String)

Ensure you have the necessary permissions to read and write to this table.
Lambda Layer

    Ensure the Lambda function has a layer that includes the necessary Node.js modules: aws-sdk, bitcoinjs-lib, bip39, tiny-secp256k1, @stacks/transactions.

### Smart Contracts

This repository includes two smart contracts for managing a tokenized asset and a stablecoin.

### Tokenized Asset Smart Contract 

```
;; Assert that this contract implements the `sip-010-trait`
;; the contract principal is the mainnet address where this trait
;; is deployed
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Set a few constants for the contract owner, and a couple of error codes
(define-constant contract-owner contract-caller)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

;; No maximum supply!
;; To provide a maximum supply, an optional second `uint` argument can be given
(define-fungible-token clarity-coin)

;; `transfer` function to move tokens around from `contract-caller` to someone else
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (is-eq contract-caller sender) err-not-token-owner)
		(try! (ft-transfer? clarity-coin amount sender recipient))
		(match memo to-print (print to-print) 0x)
		(ok true)
	)
)

(define-read-only (get-name)
	(ok "TokenizedAsset")
)

(define-read-only (get-symbol)
	(ok "TA")
)

(define-read-only (get-decimals)
	(ok u0)
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance clarity-coin who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply clarity-coin))
)

(define-read-only (get-token-uri)
	(ok none)
)

;; owner-only function to `mint` some `amount` of tokens to `recipient`
(define-public (mint (amount uint) (recipient principal))
	(begin
		(asserts! (is-eq contract-caller contract-owner) err-owner-only)
		(ft-mint? clarity-coin amount recipient)
	)
)
```



### Stablecoin Smart Contract 

```
;; Assert that this contract implements the `sip-010-trait`
;; the contract principal is the mainnet address where this trait
;; is deployed
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Set a few constants for the contract owner, and a couple of error codes
(define-constant contract-owner contract-caller)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

;; No maximum supply!
;; To provide a maximum supply, an optional second `uint` argument can be given
(define-fungible-token clarity-coin)

;; `transfer` function to move tokens around from `contract-caller` to someone else
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (is-eq contract-caller sender) err-not-token-owner)
		(try! (ft-transfer? clarity-coin amount sender recipient))
		(match memo to-print (print to-print) 0x)
		(ok true)
	)
)

(define-read-only (get-name)
	(ok "Stablecoin")
)

(define-read-only (get-symbol)
	(ok "Stable")
)

(define-read-only (get-decimals)
	(ok u0)
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance clarity-coin who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply clarity-coin))
)

(define-read-only (get-token-uri)
	(ok none)
)

;; owner-only function to `mint` some `amount` of tokens to `recipient`
(define-public (mint (amount uint) (recipient principal))
	(begin
		(asserts! (is-eq contract-caller contract-owner) err-owner-only)
		(ft-mint? clarity-coin amount recipient)
	)
)

```

### Frontend

The frontend for this project is developed using Bubble.io. Bubble.io provides a visual interface to build web applications without needing to write code. It allows integration with various APIs and backend services, making it ideal for rapid development and deployment.

### Getting Started

Clone the repository:

    
```
git clone https://github.com/your-repo/blockchain-wallet.git
cd blockchain-wallet
```    
    

Deploy the Lambda Function:
    Ensure you have the AWS CLI configured.
    Package and deploy the Lambda function using AWS SAM or the Serverless Framework.

Setup DynamoDB:
    Create a DynamoDB table named StacksWalletData with primary partition: id

Deploy Smart Contracts:
    Deploy the provided smart contracts to the Stacks blockchain.

Frontend Deployment:
    Use Bubble.io to create and deploy the frontend application.



