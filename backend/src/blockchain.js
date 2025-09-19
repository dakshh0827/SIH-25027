// File: backend/src/blockchain.js

import grpc from '@grpc/grpc-js';
import pkg from '@hyperledger/fabric-gateway';  // <-- FIX
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { connect, Contract, Identity, Signer, signers } = pkg;  // <-- destructure here

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORG1_CRYPTO_PATH = path.resolve(__dirname, '..', '..', 'fabric-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
const ORG1_KEY_PATH_DIR = path.resolve(ORG1_CRYPTO_PATH, 'users', 'Admin@org1.example.com', 'msp', 'keystore');
const ORG1_CERT_PATH = path.resolve(ORG1_CRYPTO_PATH, 'users', 'Admin@org1.example.com', 'msp', 'signcerts', 'cert.pem');
const ORG1_TLS_CERT_PATH = path.resolve(ORG1_CRYPTO_PATH, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const PEER_ENDPOINT = 'localhost:7051';
const PEER_HOST_ALIAS = 'peer0.org1.example.com';

const channelName = 'mychannel';
const chaincodeName = 'ayushtrace';
let contract;

// ... rest of your code stays unchanged


async function initializeBlockchainConnection() {
    console.log('*** Connecting to Fabric network...');
    const client = await newGrpcConnection();
    const { identity, signer } = await getIdentityAndSigner();

    const gateway = connect({
        client,
        identity,
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    try {
        const network = gateway.getNetwork(channelName);
        contract = network.getContract(chaincodeName);
        console.log('*** Successfully connected to blockchain and initialized contract.');
    } catch (error) {
        console.error('*** Failed to connect to blockchain:', error);
        gateway.close();
        process.exit(1);
    }
}

async function submitTransaction(functionName, ...args) {
    if (!contract) throw new Error('Blockchain connection not initialized.');
    console.log(`\n--> Submitting transaction: ${functionName} with arguments: ${args.join(', ')}`);
    const resultBytes = await contract.submitTransaction(functionName, ...args);
    const resultJson = Buffer.from(resultBytes).toString('utf8');
    return JSON.parse(resultJson);
}

async function evaluateTransaction(functionName, ...args) {
    if (!contract) throw new Error('Blockchain connection not initialized.');
    console.log(`\n--> Evaluating query: ${functionName} with arguments: ${args.join(', ')}`);
    const resultBytes = await contract.evaluateTransaction(functionName, ...args);
    const resultJson = Buffer.from(resultBytes).toString('utf8');
    return JSON.parse(resultJson);
}

async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(ORG1_TLS_CERT_PATH);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(PEER_ENDPOINT, tlsCredentials, {
        'grpc.ssl_target_name_override': PEER_HOST_ALIAS,
    });
}

async function getIdentityAndSigner() {
    const credentials = await fs.readFile(ORG1_CERT_PATH);
    const identity = { mspId: 'Org1MSP', credentials };

    const privateKeyFiles = await fs.readdir(ORG1_KEY_PATH_DIR);
    const privateKeyPath = path.resolve(ORG1_KEY_PATH_DIR, privateKeyFiles[0]);
    const privateKeyPem = await fs.readFile(privateKeyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    return { identity, signer };
}

export {
    initializeBlockchainConnection,
    submitTransaction,
    evaluateTransaction
};