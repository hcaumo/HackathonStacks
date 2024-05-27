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
