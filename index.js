// Required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3332;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Sample data store (in memory)
let items = [
    { 
        transaction_id: 10, 
        topic_id: 99, 
        transaction_datetime: '2025-02-01 05:01',
        number_param: 500000,
        time_param: '05:00',
        weekday_param: 'Monday',
        day_param: 0,
        is_fix: "N"
    },
    { 
        transaction_id: 20, 
        topic_id: 100, 
        transaction_datetime: '2025-02-01 15:01',
        number_param: 44,
        time_param: '06:01',
        weekday_param: null,
        day_param: 20,
        is_fix: "N" 
    }
];

// Validation helper
const validateMonitorData = (data) => {
    const errors = [];
    
    if (!data.topic_id) errors.push('topic_id is required');
    if (!data.transaction_datetime) errors.push('transaction_datetime is required');
    
    // Additional validations
    if (data.is_fix && !['Y', 'N'].includes(data.is_fix)) {
        errors.push('is_fix must be "Y" or "N"');
    }
    
    if (data.weekday_param && 
        !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(data.weekday_param)) {
        errors.push('Invalid weekday_param');
    }
    
    return errors;
};

// Routes
// GET - Get all monitors
app.get('/api/monitors', (req, res) => {
    try {
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching monitors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch monitors'
        });
    }
});

// GET - Get single monitor by transaction_id
app.get('/api/monitors/:transaction_id', (req, res) => {
    try {
        const transaction_id = parseInt(req.params.transaction_id);
        
        if (isNaN(transaction_id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction_id format'
            });
        }
        
        const item = items.find(item => item.transaction_id === transaction_id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Monitor not found'
            });
        }
        
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching monitor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch monitor'
        });
    }
});

// POST - Create new monitor
app.post('/api/monitors', (req, res) => {
    try {
        const { 
            topic_id,
            transaction_datetime,
            number_param,
            time_param,
            weekday_param,
            day_param,
            is_fix
        } = req.body;
        
        // Validate input
        const validationErrors = validateMonitorData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }
        
        // Generate new transaction_id
        const newTransactionId = Math.max(...items.map(item => item.transaction_id), 0) + 1;
        
        const newItem = {
            transaction_id: newTransactionId,
            topic_id: parseInt(topic_id),
            transaction_datetime,
            number_param: number_param ? parseInt(number_param) : null,
            time_param,
            weekday_param,
            day_param: day_param ? parseInt(day_param) : null,
            is_fix: is_fix || 'N'
        };
        
        items.push(newItem);
        
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating monitor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create monitor'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at ${new Date().toISOString()}`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API at: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    // Don't exit the process in production, just log the error
    // process.exit(1);
});