
let rooms        = [...roomsDB];
let editingId    = null;
let activeFilter = `all`;

const formatCity     = (city)    => city.toUpperCase();
const normalizeStr   = (str)     => str.toLowerCase().trim();
const matchSearch    = (room, q) => room.title.toLowerCase().includes(q)
                                 || room.city.toLowerCase().includes(q);
const cityStarts     = (city, p) => city.startsWith(p);
const cleanRent      = (val)     => val.replace(/[^0-9]/g, ``);
const formatDate     = (date)    => date.split(`-`).reverse().join(`/`);
const truncateTitle  = (title)   => title.length > 20 ? title.slice(0, 20) + `…` : title;
const padRent        = (rent)    => String(rent).padStart(6, ` `);
const capitalizeType = (type)    => type.charAt(0).toUpperCase() + type.slice(1);

const getTotalRent  = (arr) => arr.reduce((sum, r) => sum + r.rent, 0);
const getAvgRating  = (arr) => arr.length
  ? (arr.reduce((s, r) => s + r.rating, 0) / arr.length).toFixed(1)
  : `0`;
const findById      = (id)  => rooms.find(r => r.id === id);
const allVerified   = (arr) => arr.every(r => r.verified);
const anyBudget     = (arr) => arr.some(r => r.rent < 10000);
const hasCityIn     = (arr, city) => arr.map(r => r.city).includes(city);
const cheapest      = (arr) => [...arr].sort((a, b) => a.rent - b.rent)[0];

const getRoomKeys    = (room) => Object.keys(room);
const getRoomValues  = (room) => Object.values(room);
const getRoomEntries = (room) => Object.entries(room);
const cloneRoom      = (room) => Object.assign({}, room);
const dropProp       = (room, prop) => {
  const clone = cloneRoom(room);
  delete clone[prop];
  return clone;
};

function renderCards(data) {
                const grid = document.getElementById('cardsGrid');
                const empty = document.getElementById('emptyState');
                const count = document.getElementById('resultsCount');

                if (data.length === 0) {
                    grid.innerHTML = '';
                    empty.classList.remove('hidden');
                    count.textContent = 'No listings found.';
                    return;
                }

                empty.classList.add('hidden');
                count.textContent = `Showing ${data.length} listing${data.length !== 1 ? 's' : ''}`;

                grid.innerHTML = data.map(room => `
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-800">
            <div class="bg-gradient-to-br from-blue-600 to-indigo-700 h-24 flex items-center justify-center text-4xl">
                ${room.type === 'Shared' ? '👥' : room.type === 'Private' ? '🔒' : '🏢'}
            </div>
            <div class="p-5">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-bold text-base">${room.title}</h3>
                    ${room.verified
                        ? `<span class="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold px-2 py-0.5 rounded-full">✅ Verified</span>`
                        : `<span class="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-semibold px-2 py-0.5 rounded-full">⏳ Pending</span>`}
                </div>
                <p class="text-gray-500 text-sm mb-1">📍 ${room.city}</p>
                <p class="text-gray-500 text-sm mb-1">🏠 ${room.type}</p>
                <p class="text-blue-600 font-bold text-lg mb-4">PKR ${room.rent.toLocaleString()} <span class="text-gray-400 font-normal text-sm">/month</span></p>
                <div class="flex gap-2">
                    <button onclick="openEdit(${room.id})"
                        class="flex-1 py-2 text-sm font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteRoom(${room.id})"
                        class="flex-1 py-2 text-sm font-semibold bg-red-50 dark:bg-red-950 text-red-500 rounded-xl hover:bg-red-100 transition">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
            }


            function setFilter(filter) {
                activeFilter = filter;
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                    btn.classList.add('border-gray-300', 'dark:border-gray-700');
                });
                const active = document.getElementById('f-' + filter);
                active.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
                active.classList.remove('border-gray-300', 'dark:border-gray-700');
                applyFilters();
            }

            function applyFilters() {
                const query = document.getElementById('searchBar').value.toLowerCase();
                let filtered = rooms.filter(room => {
                    const matchSearch = room.title.toLowerCase().includes(query) ||
                        room.city.toLowerCase().includes(query);
                    let matchFilter = true;
                    if (activeFilter === 'verified') matchFilter = room.verified === true;
                    else if (activeFilter === 'shared') matchFilter = room.type === 'Shared';
                    else if (activeFilter === 'private') matchFilter = room.type === 'Private';
                    else if (activeFilter === 'studio') matchFilter = room.type === 'Studio';
                    else if (activeFilter === 'budget') matchFilter = room.rent < 15000;
                    return matchSearch && matchFilter;
                });
                renderCards(filtered);
            }


            function addRoom() {
                const title = document.getElementById('addTitle').value.trim();
                const city = document.getElementById('addCity').value;
                const rent = parseInt(document.getElementById('addRent').value);
                const type = document.getElementById('addType').value;
                const verified = document.getElementById('addVerified').checked;

                if (!title || !city || !rent || !type) {
                    document.getElementById('addError').classList.remove('hidden');
                    return;
                }
                document.getElementById('addError').classList.add('hidden');

                rooms.push({ id: nextId++, title, city, rent, type, verified });

                // Reset form
                document.getElementById('addTitle').value = '';
                document.getElementById('addCity').value = '';
                document.getElementById('addRent').value = '';
                document.getElementById('addType').value = '';
                document.getElementById('addVerified').checked = false;

                applyFilters();
                renderControlStructures();
            }


            function deleteRoom(id) {
                rooms = rooms.filter(r => r.id !== id);
                applyFilters();
                renderControlStructures();
            }


            function openEdit(id) {
                const room = rooms.find(r => r.id === id);
                if (!room) return;
                editingId = id;
                document.getElementById('editTitle').value = room.title;
                document.getElementById('editCity').value = room.city;
                document.getElementById('editRent').value = room.rent;
                document.getElementById('editType').value = room.type;
                document.getElementById('editVerified').checked = room.verified;
                document.getElementById('editModal').classList.remove('hidden');
            }

            function updateRoom() {
                const idx = rooms.findIndex(r => r.id === editingId);
                if (idx === -1) return;
                rooms[idx].title = document.getElementById('editTitle').value.trim();
                rooms[idx].city = document.getElementById('editCity').value;
                rooms[idx].rent = parseInt(document.getElementById('editRent').value);
                rooms[idx].type = document.getElementById('editType').value;
                rooms[idx].verified = document.getElementById('editVerified').checked;
                closeModal();
                applyFilters();
                renderControlStructures();
            }

            function closeModal() {
                document.getElementById('editModal').classList.add('hidden');
                editingId = null;
            }

const renderObjectPanel = () => {
  const panel = document.getElementById(`objectPanel`);
  if (!panel || !rooms.length) return;

  const s       = rooms[0];
  const keys    = getRoomKeys(s);
  const values  = getRoomValues(s);
  const entries = getRoomEntries(s);
  const cloned  = cloneRoom(s);
  const stripped = dropProp(s, `createdAt`);

  panel.innerHTML = `
    <div class="obj-section">
      <p class="obj-label">Object.keys(rooms[0])</p>
      <p class="obj-value">[${keys.map(k => `"${k}"`).join(`, `)}]</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">Object.values(rooms[0])</p>
      <p class="obj-value">[${values.map(v => `"${v}"`).join(`, `)}]</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">Object.entries(rooms[0]) — first 3</p>
      <p class="obj-value">${entries.slice(0, 3).map(([k, v]) => `${k}: "${v}"`).join(` | `)}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">Object.assign({}, rooms[0]) — cloned title</p>
      <p class="obj-value">"${cloned.title}"</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">delete clone.createdAt — keys after delete</p>
      <p class="obj-value">[${Object.keys(stripped).map(k => `"${k}"`).join(`, `)}]</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">map().includes("Lahore")</p>
      <p class="obj-value">${hasCityIn(rooms, `Lahore`)} — Lahore listings exist</p>
    </div>
  `;
};

const renderArrayPanel = () => {
  const panel = document.getElementById(`arrayPanel`);
  if (!panel) return;

  const cheap = cheapest(rooms);
  const found = rooms.find(r => r.verified);

  panel.innerHTML = `
    <div class="obj-section">
      <p class="obj-label">reduce() — Total Rent</p>
      <p class="obj-value">PKR ${getTotalRent(rooms).toLocaleString()}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">find() — First verified listing</p>
      <p class="obj-value">${found ? `"${found.title}" — PKR ${found.rent.toLocaleString()}` : `None found`}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">every() — All rooms verified?</p>
      <p class="obj-value">${allVerified(rooms)} — ${allVerified(rooms) ? `All verified` : `Some unverified`}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">some() — Any room under PKR 10,000?</p>
      <p class="obj-value">${anyBudget(rooms)} — ${anyBudget(rooms) ? `Budget options exist` : `None`}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">map() + includes() — Has Lahore?</p>
      <p class="obj-value">${hasCityIn(rooms, `Lahore`)} — Lahore listings ${hasCityIn(rooms, `Lahore`) ? `exist` : `not found`}</p>
    </div>
    <div class="obj-section">
      <p class="obj-label">sort() — Cheapest room</p>
      <p class="obj-value">${cheap ? `"${cheap.title}" @ PKR ${cheap.rent.toLocaleString()}` : `—`}</p>
    </div>
  `;
};

const renderStringPanel = () => {
  const panel = document.getElementById(`stringPanel`);
  if (!panel || !rooms.length) return;
  const r = rooms[0];
  panel.innerHTML = `
    <div class="obj-section"><p class="obj-label">1. toUpperCase() — city label</p><p class="obj-value">"${r.city}" → "${r.city.toUpperCase()}"</p></div>
    <div class="obj-section"><p class="obj-label">2. toLowerCase() — search normalize</p><p class="obj-value">"${r.title}" → "${r.title.toLowerCase()}"</p></div>
    <div class="obj-section"><p class="obj-label">3. trim() — clean input</p><p class="obj-value">"  cozy studio  ".trim() → "${`  cozy studio  `.trim()}"</p></div>
    <div class="obj-section"><p class="obj-label">4. includes() — search match</p><p class="obj-value">"${r.title}".includes("Studio") → ${r.title.includes(`Studio`)}</p></div>
    <div class="obj-section"><p class="obj-label">5. startsWith() — city prefix</p><p class="obj-value">"${r.city}".startsWith("La") → ${r.city.startsWith(`La`)}</p></div>
    <div class="obj-section"><p class="obj-label">6. replace() — clean rent input</p><p class="obj-value">"18,000".replace(/[^0-9]/g,"") → ${"18,000".replace(/[^0-9]/g, ``)}</p></div>
    <div class="obj-section"><p class="obj-label">7. split() — format date</p><p class="obj-value">"${r.createdAt}".split("-").reverse().join("/") → ${r.createdAt.split(`-`).reverse().join(`/`)}</p></div>
    <div class="obj-section"><p class="obj-label">8. slice() — truncate title</p><p class="obj-value">"Luxury Apartment".slice(0,10) → "${"Luxury Apartment".slice(0, 10)}…"</p></div>
    <div class="obj-section"><p class="obj-label">9. padStart() — pad rent</p><p class="obj-value">String(${r.rent}).padStart(8," ") → "${String(r.rent).padStart(8, ` `)}"</p></div>
    <div class="obj-section"><p class="obj-label">10. charAt() — capitalize type</p><p class="obj-value">"${r.type}".charAt(0).toUpperCase() → "${r.type.charAt(0).toUpperCase()}"</p></div>
  `;
};

const initApp = () => {
  initTheme();
  applyFilters();
  renderStringPanel();
};

document.addEventListener(`DOMContentLoaded`, initApp);