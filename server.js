require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const line = require('@line/bot-sdk');

const db = require('./db');
const { createPlacesCarousel, createPlaceBubble, createWelcomeMessage } = require('./flexBuilder');
const { askAI } = require('./aiHelper');

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Messaging API Config
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

// Create LINE SDK client
let lineClient = null;
if (lineConfig.channelAccessToken) {
  lineClient = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken
  });
}

// ================= 1. LINE WEBHOOK ROUTE =================
// Note: LINE Webhook requires raw body for signature validation
const webhookMiddleware = lineConfig.channelSecret 
  ? line.middleware(lineConfig)
  : (req, res, next) => {
      console.warn('[LINE Webhook] Notice: LINE_CHANNEL_SECRET is not set in .env yet. Please configure it to receive live LINE messages.');
      return res.status(200).send('OK');
    };

app.post('/webhook', webhookMiddleware, async (req, res) => {
  try {
    const events = req.body && req.body.events;
    if (!events || events.length === 0) {
      // LINE verification ping
      return res.status(200).send('OK');
    }

    // Process all events
    await Promise.all(events.map(handleLineEvent));
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// Event Handler for incoming LINE messages
async function handleLineEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userText = event.message.text.trim();
  const lowerText = userText.toLowerCase();
  console.log(`[LINE Message] Received: "${userText}" from ${event.source.userId}`);

  let replyMessages = [];

  // 1. Check for greetings or menu request
  if (['สวัสดี', 'หวัดดี', 'hello', 'hi', 'เมนู', 'help', 'สอบถาม', 'เริ่ม'].some(g => lowerText.includes(g))) {
    replyMessages = [createWelcomeMessage()];
  } 
  // 2. Button A: Website info / Link
  else if (lowerText.includes('เว็บ') || lowerText.includes('เว็บไซต์') || lowerText.includes('website')) {
    replyMessages = [
      {
        type: 'text',
        text: '🌐 ยินดีต้อนรับสู่เว็บไซต์ PHETCHABUN TRAVEL GUIDE!\n\nคุณสามารถเข้าชมเว็บไซต์หลักเพื่อดูข้อมูลสถานที่ท่องเที่ยว มรดกโลกศรีเทพ และที่พักแนะนำทั้งหมด พร้อมแผนที่นำทางแบบเต็มรูปแบบได้ที่นี่ครับ'
      },
      createWelcomeMessage()
    ];
  }
  // 3. Button D: Emergency Contacts / Help
  else if (lowerText.includes('ฉุกเฉิน') || lowerText.includes('ช่วยเหลือ') || lowerText.includes('เบอร์') || lowerText.includes('ตำรวจ') || lowerText.includes('กู้ภัย')) {
    replyMessages = [
      {
        type: 'text',
        text: `📞 ศูนย์ช่วยเหลือและเบอร์ติดต่อฉุกเฉิน จ.เพชรบูรณ์ 24 ชม.\n\n` +
              `🚨 ตำรวจท่องเที่ยว: 1155 (โทรฟรี)\n` +
              `🚑 กู้ชีพ / เจ็บป่วยฉุกเฉิน: 1669\n` +
              `🚓 ตำรวจทางหลวง: 1193\n` +
              `👮 สภ.เขาค้อ: 056-728-111\n` +
              `👮 สภ.หล่มเก่า (ภูทับเบิก): 056-709-242\n` +
              `🏥 รพ.เขาค้อ: 056-728-028\n\n` +
              `✨ เดินทางท่องเที่ยวอย่างปลอดภัยด้วยความห่วงใยจาก Phetchabun Guide ครับ!`
      }
    ];
  }
  // 4. Button C: Viewpoints & Cafes
  else if (lowerText.includes('คาเฟ่') || lowerText.includes('จุดชมวิว') || lowerText.includes('กาแฟ') || lowerText.includes('วิว')) {
    let spots = db.getAllPlaces('attraction');
    if (spots.length > 0) {
      replyMessages = [
        {
          type: 'text',
          text: `☕ แนะนำจุดชมวิวและคาเฟ่ยอดฮิตในเพชรบูรณ์ ${spots.length} แห่งครับ:`
        },
        createPlacesCarousel(spots, 'จุดชมวิว & คาเฟ่เพชรบูรณ์')
      ];
    } else {
      replyMessages = [{ type: 'text', text: 'ไม่พบข้อมูลจุดชมวิวในระบบครับ' }];
    }
  }
  // 5. Button B: Search for stays specifically (Khao Kho / Phu Thap Boek)
  else if (lowerText.includes('ที่พัก') || lowerText.includes('โรงแรม') || lowerText.includes('รีสอร์ท') || lowerText.includes('stay')) {
    let stays = db.getAllPlaces('stay');
    if (lowerText.includes('เขาค้อ')) {
      stays = stays.filter(s => s.zone === 'khaokho');
    } else if (lowerText.includes('ภูทับเบิก') || lowerText.includes('ทับเบิก')) {
      stays = stays.filter(s => s.zone === 'phuthapbuek');
    }

    if (stays.length > 0) {
      replyMessages = [
        {
          type: 'text',
          text: `🏡 พบที่พักแนะนำ ${stays.length} แห่งในฐานข้อมูลเว็บไซต์ครับ:`
        },
        createPlacesCarousel(stays, 'รวมที่พักแนะนำเพชรบูรณ์')
      ];
    } else {
      replyMessages = [{
        type: 'text',
        text: 'ขออภัยครับ ยังไม่พบที่พักในหมวดที่ค้นหา สามารถดูทั้งหมดได้ที่หน้าเว็บครับ'
      }];
    }
  }
  // 3. Search for attractions or general keywords in Database
  else {
    const searchResults = db.searchPlaces(userText);

    if (searchResults.length > 0) {
      replyMessages = [
        {
          type: 'text',
          text: `✨ พบข้อมูลที่ตรงกับ "${userText}" ทั้งหมด ${searchResults.length} รายการจากระบบหลังบ้าน:`
        },
        createPlacesCarousel(searchResults, `ผลการค้นหา ${userText}`)
      ];
    } else {
      // 6. Ask AI (Groq / xAI Grok / Gemini) using Website Database & Phetchabun Knowledge Base
      const aiReply = await askAI(userText);
      if (aiReply) {
        replyMessages = [
          {
            type: 'text',
            text: aiReply
          }
        ];
      } else {
        // Fallback response if AI is not configured or unavailable
        replyMessages = [
          {
            type: 'text',
            text: `ขออภัยครับ ไม่พบข้อมูลตรงกับ "${userText}" ในระบบ 😅\n\nคุณสามารถลองพิมพ์:\n• "ที่พักเขาค้อ"\n• "ที่พักภูทับเบิก"\n• "ผาซ่อนแก้ว"\n• "ศรีเทพ"`
          },
          createWelcomeMessage()
        ];
      }
    }
  }

  // Reply using LINE SDK client
  if (lineClient && event.replyToken) {
    try {
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: replyMessages
      });
      console.log(`[LINE Reply] Successfully replied to "${userText}"`);
    } catch (apiErr) {
      console.error('[LINE Reply Error]', apiErr.message);
    }
  } else {
    console.log('[Dev Mode] No Channel Access Token configured yet. Generated reply:', JSON.stringify(replyMessages, null, 2));
  }

  return Promise.resolve(null);
}

// ================= 2. STANDARD EXPRESS MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ================= 3. REST API ENDPOINTS (FOR WEB & ADMIN) =================

// Admin Login API
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin1234';

  if (username === adminUser && password === adminPass) {
    return res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
  }
  return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
});

// GET all places
app.get('/api/places', (req, res) => {
  const { type, zone } = req.query;
  let places = db.getAllPlaces(type);
  if (zone && zone !== 'all') {
    places = places.filter(p => p.zone === zone);
  }
  res.json({ success: true, count: places.length, data: places });
});

// GET single place by ID
app.get('/api/places/:id', (req, res) => {
  const place = db.getPlaceById(req.params.id);
  if (!place) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: place });
});

// Search places API
app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  const results = db.searchPlaces(q);
  res.json({ success: true, count: results.length, data: results });
});

// POST add new place (Admin)
app.post('/api/places', (req, res) => {
  try {
    const newPlace = db.addPlace(req.body);
    res.status(201).json({ success: true, message: 'Added successfully', data: newPlace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update place (Admin)
app.put('/api/places/:id', (req, res) => {
  try {
    const updated = db.updatePlace(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, message: 'Updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE place (Admin)
app.delete('/api/places/:id', (req, res) => {
  try {
    const ok = db.deletePlace(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Route for Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Phetchabun Web & LINE Server is RUNNING!`);
  console.log(`🌐 Website URL:  http://localhost:${PORT}`);
  console.log(`⚙️ Admin CMS:    http://localhost:${PORT}/admin`);
  console.log(`📡 LINE Webhook: http://localhost:${PORT}/webhook`);
  console.log(`====================================================`);
});
