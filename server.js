const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Append to Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:B',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[email, new Date().toISOString()]],
            },
        });

        res.json({ message: 'Thank you for subscribing!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error adding subscriber' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 