// flexBuilder.js - Generates LINE Flex Messages from database items

// Build a single place bubble
function createPlaceBubble(place) {
  const isStay = place.type === 'stay';
  const tagColor = isStay ? '#059669' : '#0284c7';
  const tagText = isStay ? '🏡 ที่พักแนะนำ' : '🏔️ สถานที่ท่องเที่ยว';

  return {
    type: 'bubble',
    size: 'kilo',
    hero: {
      type: 'image',
      url: place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
      size: 'full',
      aspectRatio: '16:9',
      aspectMode: 'cover'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: tagText,
          weight: 'bold',
          color: tagColor,
          size: 'xxs'
        },
        {
          type: 'text',
          text: place.name_th || place.name_en,
          weight: 'bold',
          size: 'md',
          wrap: true
        },
        {
          type: 'box',
          layout: 'baseline',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: '💰',
              size: 'xs',
              color: '#d97706'
            },
            {
              type: 'text',
              text: place.price || 'ติดต่อสอบถาม',
              size: 'xs',
              weight: 'bold',
              color: '#059669'
            }
          ]
        },
        {
          type: 'text',
          text: place.description_th || place.description_en || '',
          size: 'xxs',
          color: '#6b7280',
          maxLines: 2,
          wrap: true
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          margin: 'sm',
          contents: [
            {
              type: 'text',
              text: `📞 โทร: ${place.phone || '-'}`,
              size: 'xxs',
              color: '#374151'
            },
            {
              type: 'text',
              text: `💬 LINE: ${place.line_id || '-'}`,
              size: 'xxs',
              color: '#374151'
            },
            {
              type: 'text',
              text: `📍 ${place.address_th || '-'}`,
              size: 'xxs',
              color: '#9ca3af',
              maxLines: 1
            }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'secondary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '🗺️ นำทาง',
            uri: place.map_url && place.map_url.startsWith('http') ? place.map_url : `https://maps.google.com/?q=${encodeURIComponent(place.name_th)}`
          }
        },
        ...(place.phone ? [{
          type: 'button',
          style: 'primary',
          color: '#06C755',
          height: 'sm',
          action: {
            type: 'uri',
            label: '📞 โทรจอง',
            uri: `tel:${place.phone.replace(/[^0-9]/g, '')}`
          }
        }] : [])
      ]
    }
  };
}

// Build a Carousel of places (up to 10 bubbles max as per LINE API spec)
function createPlacesCarousel(places, altTitle = 'ข้อมูลท่องเที่ยวและที่พักเพชรบูรณ์') {
  const bubbles = places.slice(0, 10).map(createPlaceBubble);

  return {
    type: 'flex',
    altText: altTitle,
    contents: {
      type: 'carousel',
      contents: bubbles
    }
  };
}

// Build Welcome Quick-Reply Menu
function createWelcomeMessage() {
  return {
    type: 'text',
    text: `สวัสดีครับ! ยินดีต้อนรับสู่ Phetchabun Travel & Stay Guide 🌲☁️\n\nระบบของเราเชื่อมต่อกับฐานข้อมูลเว็บไซต์แบบ Real-time คุณสามารถพิมพ์ค้นหา เช่น:\n• "ที่พักเขาค้อ"\n• "ที่พักภูทับเบิก"\n• "ผาซ่อนแก้ว"\n\nหรือกดปุ่มเมนูด่วนด้านล่างได้เลยครับ 👇`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'message',
            label: '🏡 ที่พักเขาค้อ',
            text: 'ที่พักเขาค้อ'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '⛺ ที่พักภูทับเบิก',
            text: 'ที่พักภูทับเบิก'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '🛕 วัดผาซ่อนแก้ว',
            text: 'วัดผาซ่อนแก้ว'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '🍗 ของกินของฝาก',
            text: 'ของกิน'
          }
        }
      ]
    }
  };
}

module.exports = {
  createPlaceBubble,
  createPlacesCarousel,
  createWelcomeMessage
};
