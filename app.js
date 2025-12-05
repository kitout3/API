const storageKey = 'emargement-events';
let events = loadEvents();
let currentEventId = null;
let modalImportCache = [];
let lastImportSummary = '';
let html5Qr = null;

function uid() {
  return crypto.randomUUID();
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Impossible de charger le stockage', e);
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(storageKey, JSON.stringify(events));
}

function statusFromDate(dateString) {
  if (!dateString) return 'upcoming';
  const target = new Date(dateString);
  const today = new Date();
  if (target.toDateString() === today.toDateString()) return 'ongoing';
  if (target > today) return 'upcoming';
  return 'past';
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
}

function openModal() {
  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalImportSummary').textContent = '';
  modalImportCache = [];
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
  document.getElementById('eventName').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventCapacity').value = '';
  document.getElementById('eventLocation').value = '';
  document.getElementById('eventDescription').value = '';
  document.getElementById('modalImport').value = '';
  modalImportCache = [];
}

function renderEvents() {
  const container = document.getElementById('eventList');
  const search = document.getElementById('eventSearch').value.toLowerCase();
  const start = document.getElementById('filterStart').value;
  const end = document.getElementById('filterEnd').value;
  const status = document.getElementById('statusFilter').value;

  const filtered = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(search);
    const evtDate = evt.date ? new Date(evt.date) : null;
    const matchesStart = start ? evtDate >= new Date(start) : true;
    const matchesEnd = end ? evtDate <= new Date(`${end}T23:59:59`) : true;
    const matchesStatus = status ? statusFromDate(evt.date) === status : true;
    return matchesSearch && matchesStart && matchesEnd && matchesStatus;
  });

  container.innerHTML = '';
  if (!filtered.length) {
    container.classList.add('empty');
    container.innerHTML = '<div class="empty-state"><p>Aucun événement ne correspond.</p></div>';
    return;
  }
  container.classList.remove('empty');

  filtered.forEach((evt) => {
    const card = document.createElement('div');
    card.className = 'event-card';
    const status = statusFromDate(evt.date);
    card.innerHTML = `
      <div class="event-meta">${formatDate(evt.date)} ${evt.location ? '• ' + evt.location : ''}</div>
      <h3>${evt.name}</h3>
      <p class="event-meta">${evt.participants.length} inscrits${evt.capacity ? ' • Capacité ' + evt.capacity : ''}</p>
      <div class="event-actions">
        <span class="pill">${status}</span>
        <button class="primary" data-id="${evt.id}">Gérer</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => selectEvent(evt.id));
    container.appendChild(card);
  });
}

function selectEvent(id) {
  currentEventId = id;
  const evt = events.find((e) => e.id === id);
  if (!evt) return;
  document.getElementById('eventDetail').classList.remove('hidden');
  document.getElementById('detailTitle').textContent = evt.name;
  document.getElementById('detailMeta').textContent = `${formatDate(evt.date)}${evt.location ? ' • ' + evt.location : ''}`;
  document.getElementById('detailStatus').textContent = statusFromDate(evt.date);
  updateStats();
  renderParticipants();
  switchTab('scan');
}

function updateStats() {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return;
  const total = evt.participants.length;
  const present = evt.participants.filter((p) => p.presence === 'present').length;
  const onsite = evt.participants.filter((p) => p.onsite).length;
  const presenceRate = total ? Math.round((present / total) * 100) : 0;
  const fillRate = evt.capacity ? Math.round((present / evt.capacity) * 100) : 0;

  document.getElementById('statRegistered').textContent = total;
  document.getElementById('statPresent').textContent = present;
  document.getElementById('statPresenceRate').textContent = presenceRate + '%';
  document.getElementById('statFillRate').textContent = fillRate + '%';
  document.getElementById('statOnSite').textContent = onsite;
  document.getElementById('statUpdated').textContent = evt.updatedAt ? formatDate(evt.updatedAt) : '-';
  document.getElementById('badgeCount').textContent = total;
}

function renderParticipants() {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return;
  const container = document.getElementById('participantList');
  const search = document.getElementById('participantSearch').value.toLowerCase();
  const filter = document.getElementById('presenceFilter').value;

  const filtered = evt.participants.filter((p) => {
    const matchesSearch = `${p.nom} ${p.prenom} ${p.email} ${p.id_client}`.toLowerCase().includes(search);
    const matchesPresence =
      filter === 'present' ? p.presence === 'present'
      : filter === 'absent' ? p.presence !== 'present'
      : filter === 'onsite' ? p.onsite
      : true;
    return matchesSearch && matchesPresence;
  });

  container.innerHTML = '';
  if (!filtered.length) {
    container.classList.add('empty');
    container.innerHTML = '<p class="empty-state">Aucun participant.</p>';
    return;
  }
  container.classList.remove('empty');

  filtered.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'participant';
    const presenceBadge = p.presence === 'present' ? '<span class="present">Présent</span>' : '<span class="absent">Non émargé</span>';
    const onsiteBadge = p.onsite ? '<span class="onsite">Sur place</span>' : '';
    row.innerHTML = `
      <div class="participant-info">
        <strong>${p.nom.toUpperCase()} ${p.prenom}</strong>
        <div class="meta">${p.email} • ID ${p.id_client}</div>
        <div class="meta">Source : ${p.source} ${p.mode ? '• Mode : ' + p.mode : ''} ${p.presenceDate ? '• ' + formatDate(p.presenceDate) : ''}</div>
        <div class="presence">${presenceBadge}${onsiteBadge}</div>
      </div>
      <div class="participant-actions">
        ${p.presence === 'present' ? '<button class="ghost" data-action="undo">Annuler</button>' : '<button class="primary" data-action="mark">Marquer</button>'}
      </div>
    `;
    row.querySelector('button').addEventListener('click', () => {
      if (p.presence === 'present') {
        updatePresence(p.id_client, false, 'manual');
      } else {
        updatePresence(p.id_client, true, 'manual');
      }
    });
    container.appendChild(row);
  });
}

function updatePresence(idClient, present, mode) {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return;
  const participant = evt.participants.find((p) => p.id_client === idClient);
  if (!participant) return;
  participant.presence = present ? 'present' : 'absent';
  participant.mode = mode;
  participant.presenceDate = present ? new Date().toISOString() : null;
  evt.updatedAt = new Date().toISOString();
  saveEvents();
  updateStats();
  renderParticipants();
}

function addParticipant(data, markPresent) {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return { added: false, reason: 'Aucun événement sélectionné' };
  const idClient = data.id_client || uid();
  if (evt.participants.some((p) => p.id_client === idClient)) {
    return { added: false, reason: 'ID client déjà présent' };
  }
  const newParticipant = {
    id_client: idClient,
    nom: data.nom || 'Inconnu',
    prenom: data.prenom || '',
    email: data.email || '',
    company: data.company || data.societe || '',
    ticket: data.ticket || data.type_de_billet || '',
    source: data.source || 'manual',
    onsite: data.onsite || false,
    presence: markPresent ? 'present' : 'absent',
    presenceDate: markPresent ? new Date().toISOString() : null,
    mode: markPresent ? (data.mode || 'manual') : null,
    createdAt: new Date().toISOString(),
  };
  evt.participants.push(newParticipant);
  evt.updatedAt = new Date().toISOString();
  saveEvents();
  updateStats();
  renderParticipants();
  return { added: true };
}

function parseExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    const required = ['id_client', 'nom', 'email'];
    const missing = required.filter((key) => !Object.keys(rows[0] || {}).includes(key));
    if (missing.length) {
      alert('Colonnes manquantes : ' + missing.join(', '));
      return;
    }
    callback(rows);
  };
  reader.readAsArrayBuffer(file);
}

function importParticipants(rows, targetEventId) {
  const evt = events.find((e) => e.id === targetEventId);
  if (!evt) return;
  let imported = 0;
  let duplicates = 0;
  rows.forEach((row) => {
    const exists = evt.participants.some((p) => p.id_client === row.id_client);
    if (exists) {
      duplicates += 1;
      return;
    }
    const added = addParticipant({ ...row, source: 'import' }, false);
    if (added.added) imported += 1;
  });
  lastImportSummary = `${imported} ajoutés • ${duplicates} doublons ignorés`;
  document.getElementById('importSummary').textContent = lastImportSummary;
  document.getElementById('modalImportSummary').textContent = lastImportSummary;
}

function switchTab(tab) {
  ['scan', 'list', 'export'].forEach((key) => {
    document.querySelector(`[data-tab="${key}"]`).classList.toggle('active', key === tab);
    document.getElementById(`tab-${key}`).classList.toggle('hidden', key !== tab);
  });
}

function startScanner() {
  if (!currentEventId) return alert('Sélectionnez un événement.');
  const reader = document.getElementById('qr-reader');
  reader.innerHTML = '';
  html5Qr = new Html5Qrcode('qr-reader');
  html5Qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, (decoded) => {
    handleScan(decoded.trim());
  }, (err) => console.warn(err));
  document.getElementById('scanResult').textContent = 'Scanner actif...';
}

function stopScanner() {
  if (html5Qr) {
    html5Qr.stop().then(() => html5Qr.clear());
  }
  document.getElementById('scanResult').textContent = 'Scanner arrêté.';
}

function handleScan(idClient) {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return;
  const participant = evt.participants.find((p) => p.id_client === idClient);
  if (!participant) {
    document.getElementById('scanResult').textContent = `Inconnu : ${idClient}`;
    return;
  }
  if (participant.presence === 'present') {
    document.getElementById('scanResult').textContent = `${participant.nom} déjà émargé.`;
    return;
  }
  updatePresence(idClient, true, 'scan');
  document.getElementById('scanResult').textContent = `${participant.nom} marqué présent.`;
}

function exportExcel(filter) {
  const evt = events.find((e) => e.id === currentEventId);
  if (!evt) return;
  let rows = evt.participants;
  if (filter === 'present') rows = rows.filter((p) => p.presence === 'present');
  if (filter === 'absent') rows = rows.filter((p) => p.presence !== 'present');
  if (filter === 'onsite') rows = rows.filter((p) => p.onsite);
  const data = rows.map((p) => ({
    id_client: p.id_client,
    nom: p.nom,
    prenom: p.prenom,
    email: p.email,
    statut: p.presence,
    presenceDate: p.presenceDate ? formatDate(p.presenceDate) : '',
    mode: p.mode || '',
    source: p.source || '',
    onsite: p.onsite ? 'oui' : 'non',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participants');
  XLSX.writeFile(wb, `${evt.name || 'export'}.xlsx`);
}

function resetDemo() {
  if (confirm('Supprimer toutes les données locales ?')) {
    localStorage.removeItem(storageKey);
    events = [];
    currentEventId = null;
    renderEvents();
    document.getElementById('eventDetail').classList.add('hidden');
  }
}

// Event listeners

document.getElementById('newEventBtn').addEventListener('click', openModal);
document.getElementById('firstEventBtn').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

['eventSearch', 'filterStart', 'filterEnd', 'statusFilter'].forEach((id) => {
  document.getElementById(id).addEventListener('input', renderEvents);
});

['participantSearch', 'presenceFilter'].forEach((id) => {
  document.getElementById(id).addEventListener('input', renderParticipants);
});

document.getElementById('saveEvent').addEventListener('click', () => {
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  if (!name || !date) {
    alert('Le nom et la date sont obligatoires');
    return;
  }
  const evt = {
    id: uid(),
    name,
    date,
    capacity: document.getElementById('eventCapacity').value,
    location: document.getElementById('eventLocation').value,
    description: document.getElementById('eventDescription').value,
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(evt);
  saveEvents();
  renderEvents();
  closeModal();
  selectEvent(evt.id);
  if (modalImportCache.length) {
    importParticipants(modalImportCache, evt.id);
  }
});

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

['detailImport', 'modalImport'].forEach((id) => {
  document.getElementById(id).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseExcel(file, (rows) => {
      if (id === 'modalImport') {
        modalImportCache = rows;
        lastImportSummary = `${rows.length} lignes prêtes à être importées`;
        document.getElementById('modalImportSummary').textContent = lastImportSummary;
      } else if (currentEventId) {
        importParticipants(rows, currentEventId);
        updateStats();
        renderParticipants();
      }
    });
  });
});

['addAsPresent', 'addAsPending'].forEach((id) => {
  document.getElementById(id).addEventListener('click', () => {
    const nom = document.getElementById('addNom').value.trim();
    const prenom = document.getElementById('addPrenom').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    if (!nom || !prenom || !email) return alert('Nom, prénom et email sont requis');
    const data = {
      nom,
      prenom,
      email,
      id_client: document.getElementById('addClientId').value.trim(),
      company: document.getElementById('addCompany').value.trim(),
      ticket: document.getElementById('addTicket').value.trim(),
      onsite: true,
      source: 'manual',
    };
    const mark = id === 'addAsPresent';
    const result = addParticipant(data, mark);
    if (!result.added) alert(result.reason);
    document.getElementById('addClientId').value = '';
    document.getElementById('addCompany').value = '';
    document.getElementById('addTicket').value = '';
  });
});

document.getElementById('startScanner').addEventListener('click', startScanner);
document.getElementById('stopScanner').addEventListener('click', stopScanner);
document.getElementById('exportBtn').addEventListener('click', () => exportExcel(document.getElementById('exportFilter').value));
document.getElementById('resetDataBtn').addEventListener('click', resetDemo);

renderEvents();
