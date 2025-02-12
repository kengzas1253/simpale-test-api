// Required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
//const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 3332;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data store (in memory)
let items = [
    { topic_id: 10, sender: 'LMS', topic: 'TEST_NBO-OUTPUT-CAMPAIGN',frequency: 'Daily',is_fix:'N',verification_number: 555555,verification_time:"10/20/2024 4:00"},
    { topic_id: 20, sender: 'Item 2', topic: 'Second item',frequency: 'Daily',is_fix:'N',verification_number: 200,verification_time:"10/20/2024 4:00" }
];

// Routes
// GET - Get all items
app.get('/api/monitors', (req, res) => {
    res.json({
        success: true,
        data: items
    });
});
// GET - Get single item by topic_id
app.get('/api/monitors/:topic_id', (req, res) => {
    const item = items.find(item => item.topic_id === parseInt(req.params.topic_id));
    
    if (!item) {
        return res.status(404).json({
            success: false,
            error: 'Item not found'
        });
    }
    
    res.json({
        success: true,
        data: item
    });
});

app.post('/api/monitors', (req, res) => {
    const { sender, topic } = req.body;
    
    if (!sender || !topic) {
        return res.status(400).json({
            success: false,
            error: 'Please provtopic_ide sender and topic'
        });
    }
    
    const newItem = {
        topic_id: items.length + 1,
        sender,
        topic,
        frequency,
        is_fix,
        verification_number,
        verification_time
    };
    
    items.push(newItem);
    
    res.status(201).json({
        success: true,
        data: newItem
    });
});

// Error handling mtopic_iddleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API at: http://localhost:${PORT}`);
});