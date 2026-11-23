const db = require('./db');

// คลังข้อมูลความรู้เพชรบูรณ์ฉบับสมบูรณ์ (Knowledge Base สำหรับ AI)
const PHETCHABUN_KNOWLEDGE = `
ข้อมูลความรู้เพิ่มเติมสำหรับการท่องเที่ยวเพชรบูรณ์:
1. การเดินทางจากกรุงเทพฯ:
   - รถยนต์ส่วนตัว: ใช้ทางหลวงหมายเลข 1 (พหลโยธิน) -> สระบุรี -> ทางหลวงหมายเลข 21 ผ่านลพบุรี-วิเชียรบุรี-เพชรบูรณ์-เขาค้อ (4.5 - 5.5 ชม.)
   - รถโดยสาร: ขึ้นรถทัวร์ที่หมอชิต 2 สายกรุงเทพฯ-หล่มสัก หรือ กรุงเทพฯ-เพชรบูรณ์ ลงที่หล่มสัก/แคมป์สน แล้วต่อรถสองแถวหรือรถเช่า
   - คำแนะนำขับรถขึ้นภูทับเบิก: เส้นทางโค้งชัน 111 โค้ง ควรใช้เกียร์ต่ำ (L/S หรือ +/-) ทั้งขาขึ้น-ขาลง ตรวจสภาพเบรกให้พร้อม และเปิดไฟตัดหมอกเมื่อหมอกลงจัด

2. ฤดูกาลและช่วงเวลาน่าเที่ยว:
   - ฤดูฝน (มิ.ย. - ก.ย.): ทะเลหมอกหนาสวยที่สุด ภูเขาสีเขียวขจี อากาศเย็น 18-24 องศา
   - ฤดูหนาว (ต.ค. - ก.พ.): อากาศหนาวจัด (8-18 องศา) มีดอกซากุระเมืองไทย (นางพญาเสือโคร่ง) บานที่ภูลมโลช่วง ม.ค.
   - ฤดูร้อน (มี.ค. - พ.ค.): บนยอดเขาค้อและภูทับเบิกยังคงอากาศเย็นสบายกว่าพื้นราบ

3. แผนเที่ยวแนะนำ (Itinerary):
   - ทริป 2 วัน 1 คืน: วันแรก แวะศรีเทพมรดกโลก/ไก่ย่างวิเชียรบุรี -> วัดผาซ่อนแก้ว -> จิบกาแฟ Pino Latte -> นอนเขาค้อ / วันที่ 2 ดูหมอกเขาตะเคียนโง๊ะ -> ทุ่งกังหันลม -> ซื้อของฝากไร่บีเอ็น
   - ทริป 3 วัน 2 คืน: เพิ่มวันขึ้นยอดภูทับเบิก นอนเต็นท์โดมชมดาว กินหมูกระทะท้าลมหนาว และแวะขนมจีนหล่มเก่า

4. อาหารขึ้นชื่อ & ของฝากห้ามพลาด:
   - ไก่ย่างวิเชียรบุรี (หนังกรอบ เนื้อนุ่ม น้ำจิ้มเด็ด)
   - มะขามหวานเพชรบูรณ์ (พันธุ์สีทอง, ศรีชมพู, ขันตี)
   - ขนมจีนหล่มเก่า (เส้นสด น้ำยาหลากหลาย กินคู่ผักสดริมทาง)
   - สตรอว์เบอร์รีและผักกะหล่ำปลีสดบนภูทับเบิก, กาแฟอาราบิก้าเขาค้อ

5. เบอร์ติดต่อฉุกเฉิน 24 ชม.:
   - ตำรวจท่องเที่ยว: 1155 | กู้ชีพฉุกเฉิน: 1669 | ตำรวจทางหลวง: 1193
   - สภ.เขาค้อ: 056-728-111 | สภ.หล่มเก่า: 056-709-242

6. รายชื่อสมาชิกผู้จัดทำระบบ Phetchabun Guide (วิชา ICT314):
   - 66038226 กฤติยา พรมแดน
   - 66066139 ณัฐนันท์ วงศ์เสน่ห์
   - 66044073 สรวิศ ตรีโชติ
   - 66014451 ณัฐพล บุราณ
   - 66050248 ทรงฤทธิ์ คำแก้ว
`;

/**
 * เรียกใช้ AI (รองรับทั้ง Groq / xAI Grok / Google Gemini) เพื่อตอบคำถามนักท่องเที่ยวใน LINE OA
 * โดยดึงข้อมูลสดๆ จาก Database ของเว็บไซต์ + คลังข้อมูลเพชรบูรณ์
 * @param {string} userMessage ข้อความจากผู้ใช้ใน LINE
 * @returns {Promise<string|null>}
 */
async function askAI(userMessage) {
  const grokKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!grokKey && !geminiKey) {
    return null;
  }

  // ดึงข้อมูลสถานที่และที่พักล่าสุดทั้งหมดจาก Database ของเว็บไซต์
  const allPlaces = db.getAllPlaces();
  const placesContext = allPlaces.map(p => (
    `- [${p.type === 'stay' ? 'ที่พัก' : 'ที่เที่ยว/คาเฟ่'}] ${p.name_th} (${p.name_en}) | โซน: ${p.zone} | ราคา: ${p.price} | โทร: ${p.phone} | LINE: ${p.line_id} | รายละเอียด: ${p.description_th} | แผนที่: ${p.map_url}`
  )).join('\n');

  const systemPrompt = `คุณคือ "น้องไกด์เพชรบูรณ์" ผู้ช่วย AI อัจฉริยะประจำ LINE Official Account (@816emgzx) ของเว็บไซต์ Phetchabun Travel & Stay Guide
หน้าที่ของคุณคือตอบคำถามนักท่องเที่ยวในแชท LINE อย่างเป็นกันเอง สนุก ทันสมัย สุภาพ กระชับ และอ่านง่าย (ใช้ Emoji ให้ดูน่าอ่าน)

กฎสำคัญ:
1. ถ้าถามเรื่องที่พัก ราคา เบอร์โทร LINE ID หรือสถานที่เที่ยว ให้แนะนำจาก "คลังข้อมูลเว็บไซต์" ด้านล่างเป็นหลัก และระบุเบอร์โทร/ราคา/ลิงก์แผนที่ให้ครบถ้วน
2. ถ้าถามเรื่องวางแผนเที่ยว อาหาร การเดินทาง หรือสภาพอากาศ ให้ตอบโดยอ้างอิงจาก "คลังข้อมูลความรู้เพิ่มเติม"
3. ตอบให้กระชับ อ่านจบไวในมือถือ (ประมาณ 3-7 บรรทัด) เว้นบรรทัดให้อ่านง่าย
4. หากผู้ใช้ถามเป็นภาษาอังกฤษ ให้ตอบเป็นภาษาอังกฤษ
5. ห้ามใช้รูปแบบ Markdown เช่น **ตัวหนา** หรือ [ชื่อลิงก์](url) ให้พิมพ์เป็นข้อความธรรมดาและวางลิงก์ URL เต็มๆ เพื่อให้กดเปิดในแชท LINE ได้ทันที

=== คลังข้อมูลเว็บไซต์ (อัปเดตล่าสุด) ===
${placesContext}

=== คลังข้อมูลความรู้เพิ่มเติม ===
${PHETCHABUN_KNOWLEDGE}
`;

  // 1. กรณีใช้ Groq (api.groq.com) หรือ xAI Grok (api.x.ai)
  if (grokKey) {
    try {
      const isXAI = grokKey.startsWith('xai-');
      const endpoint = isXAI
        ? 'https://api.x.ai/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';
      const model = isXAI
        ? (process.env.GROK_MODEL || 'grok-3-mini')
        : (process.env.GROQ_MODEL || 'openai/gpt-oss-120b');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[${isXAI ? 'xAI Grok' : 'Groq'} Error]`, response.status, errText);
      } else {
        const data = await response.json();
        const replyText = data?.choices?.[0]?.message?.content;
        if (replyText) return replyText.trim();
      }
    } catch (err) {
      console.error('[Grok/Groq Exception]', err.message);
    }
  }

  // 2. Fallback ไปใช้ Google Gemini หากตั้งค่าไว้
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) return replyText.trim();
      }
    } catch (err) {
      console.error('[Gemini Exception]', err.message);
    }
  }

  return null;
}

module.exports = { askAI };
