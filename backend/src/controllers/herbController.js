// File: backend/src/controllers/herbController.js

import { submitTransaction, evaluateTransaction } from '../blockchain.js';

export const recordHerbCollection = async (req, res) => {
    try {
        const { batchID, speciesName, collectorID, latitude, longitude, initialWeight } = req.body;
        const timestamp = new Date().toISOString();

        const result = await submitTransaction(
            'recordCollectionEvent',
            batchID,
            speciesName,
            collectorID,
            timestamp,
            latitude,
            longitude,
            initialWeight
        );

        res.status(201).json({ message: 'Collection event recorded successfully', data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit transaction', details: error.message });
    }
};

export const getHerbHistory = async (req, res) => {
    try {
        const batchID = req.params.id;
        const result = await evaluateTransaction(
            'getHerbProvenance',
            batchID
        );

        res.status(200).json({ message: 'Query successful', data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to evaluate query', details: error.message });
    }
};