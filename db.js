const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Read database
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { places: [] };
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    return { places: [] };
  }
}

// Save database
function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// Get all places (can filter by type e.g. stay, attraction)
function getAllPlaces(type = null) {
  const db = readDb();
  if (!type) return db.places;
  return db.places.filter(p => p.type === type);
}

// Get single place by ID
function getPlaceById(id) {
  const db = readDb();
  return db.places.find(p => String(p.id) === String(id));
}

// Search places by keyword (used by LINE Bot & search bar)
function searchPlaces(keyword) {
  if (!keyword) return [];
  const query = keyword.trim().toLowerCase();
  const db = readDb();

  return db.places.filter(p => {
    // Check Thai name
    if (p.name_th && p.name_th.toLowerCase().includes(query)) return true;
    // Check English name
    if (p.name_en && p.name_en.toLowerCase().includes(query)) return true;
    // Check zone
    if (p.zone && p.zone.toLowerCase().includes(query)) return true;
    // Check keywords list
    if (Array.isArray(p.keywords)) {
      if (p.keywords.some(k => k.toLowerCase().includes(query) || query.includes(k.toLowerCase()))) {
        return true;
      }
    }
    return false;
  });
}

// Add a new place (Admin)
function addPlace(item) {
  const db = readDb();
  const newId = String(Date.now());
  const newPlace = {
    id: newId,
    name_th: item.name_th || '',
    name_en: item.name_en || '',
    type: item.type || 'stay',
    zone: item.zone || 'khaokho',
    price: item.price || 'ติดต่อสอบถาม',
    description_th: item.description_th || '',
    description_en: item.description_en || '',
    phone: item.phone || '',
    line_id: item.line_id || '-',
    address_th: item.address_th || '',
    address_en: item.address_en || '',
    map_url: item.map_url || '',
    image_url: item.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    rating: item.rating || '4.8',
    keywords: item.keywords ? (Array.isArray(item.keywords) ? item.keywords : item.keywords.split(',').map(s => s.trim())) : []
  };

  db.places.push(newPlace);
  saveDb(db);
  return newPlace;
}

// Update an existing place (Admin)
function updatePlace(id, updatedFields) {
  const db = readDb();
  const index = db.places.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;

  if (updatedFields.keywords && typeof updatedFields.keywords === 'string') {
    updatedFields.keywords = updatedFields.keywords.split(',').map(s => s.trim());
  }

  db.places[index] = { ...db.places[index], ...updatedFields };
  saveDb(db);
  return db.places[index];
}

// Delete a place (Admin)
function deletePlace(id) {
  const db = readDb();
  const index = db.places.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;

  db.places.splice(index, 1);
  saveDb(db);
  return true;
}

module.exports = {
  getAllPlaces,
  getPlaceById,
  searchPlaces,
  addPlace,
  updatePlace,
  deletePlace
};
