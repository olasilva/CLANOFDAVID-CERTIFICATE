import './style.css'

const app = document.querySelector('#app')
// No longer pre-fill with current day/year
const year = ''
const today = ''

// ============================================
// BACKEND API CONFIGURATION
// ============================================
const BACKEND_ORIGIN = 'https://formbackend-eqi9.vercel.app';
const API_URL = `${BACKEND_ORIGIN}/api/submissions`;

const documentTypes = [
  { id: 'merit', label: 'Certificate of Merit', short: 'Merit certificate' },
  { id: 'completion', label: 'Certificate of Completion', short: 'Completion certificate' },
  { id: 'attendance', label: 'Certificate of Attendance', short: 'Attendance certificate' },
  { id: 'idcard', label: 'Student ID Card', short: 'Student ID card' },
]

const state = {
  type: 'merit',
  logo: '/images/logo.png',
  photo: '',
  coordinatorSignature: '',
  directorSignature: '',
  recipient: '',
  grade: '',
  course: '',
  day: '',          // empty by default
  year: '',         // empty by default
  coordinator: '',
  director: '',
  studentId: '',
  phone: '',
}

// Default signature paths (relative to public folder) - UPDATED TO PNG
const DEFAULT_COORD_SIG = '/images/cod_signature.png';
const DEFAULT_DIRECTOR_SIG = '/images/codsign2.png';

const certificateFields = [
  ['recipient', 'Recipient name', 'e.g. Ben Glory'],
  ['grade', 'Grade', 'e.g. 5'],
  ['course', 'Course', 'e.g. Piano'],
  ['day', 'Day', 'e.g. 12'],
  ['year', 'Year', 'e.g. 2026'],
  ['coordinator', 'Training coordinator', 'Coordinator name'],
  ['director', 'Director', 'Director name'],
]

const idFields = [
  ['recipient', 'Student name', 'e.g. Gen Glory'],
  ['course', 'Course', 'e.g. Piano'],
  ['grade', 'Grade', 'e.g. 5'],
  ['studentId', 'Student ID', 'e.g. COD-2026-001'],
  ['phone', 'Phone number', 'e.g. +234 706 809 8651'],
]

// --- Notification System ---
let submissions = []
let notificationCount = 0
let lastFetchCount = 0
let fetchInterval = null
let isFetching = false

// ============================================
// BACKGROUND REMOVAL FUNCTION
// ============================================
function removeBackground(dataUrl, targetColor = 'white') {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Remove white/near-white pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// ============================================
// LOAD DEFAULT SIGNATURES (with background removal)
// ============================================
async function loadDefaultSignatures() {
  const processSignature = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Not found');
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      const cleaned = await removeBackground(dataUrl);
      return cleaned;
    } catch (error) {
      console.warn(`Could not load default signature at ${path}`);
      return '';
    }
  };

  const [coordSig, dirSig] = await Promise.all([
    processSignature(DEFAULT_COORD_SIG),
    processSignature(DEFAULT_DIRECTOR_SIG)
  ]);

  if (coordSig) state.coordinatorSignature = coordSig;
  if (dirSig) state.directorSignature = dirSig;
}

// ============================================
// PHOTO RESOLUTION
// ============================================
function resolvePhotoUrl(photo) {
  if (!photo || photo === 'null' || photo === 'undefined' || photo === '') {
    return '';
  }
  
  if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
    return photo;
  }
  
  if (photo.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${photo}`;
  }
  
  if (photo.startsWith('/')) {
    return `${BACKEND_ORIGIN}${photo}`;
  }
  
  return `${BACKEND_ORIGIN}/${photo}`;
}

// Normalize a raw backend submission
function normalizeSubmission(raw) {
  return {
    id: raw.id,
    fullName: raw.fullName || raw.full_name || raw.name || 'Unknown',
    email: raw.email || '',
    phone: raw.phone || '',
    course: raw.course || '',
    grade: raw.grade || '',
    studentId: raw.studentId || raw.student_id || '',
    message: raw.message || '',
    photo: raw.photo || '',
    status: raw.status || 'pending',
    read: false,
    submittedAt: raw.submittedAt || raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

// Fetch submissions from backend
async function fetchSubmissions(manual = false) {
  if (isFetching) return;
  isFetching = true;
  setRefreshLoading(true);

  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const raw = await response.json();
      
      console.log('📥 Raw submissions data:', raw);
      raw.forEach(item => {
        if (item.photo) {
          console.log('📷 Photo field:', item.photo);
          console.log('📷 Resolved photo URL:', resolvePhotoUrl(item.photo));
        }
      });

      const normalized = raw.map(item => {
        const existing = submissions.find(s => s.id === item.id);
        const n = normalizeSubmission(item);
        n.read = existing ? existing.read : false;
        return n;
      });

      if (normalized.length > lastFetchCount && lastFetchCount > 0) {
        const newSubmissions = normalized.slice(0, normalized.length - lastFetchCount);
        newSubmissions.forEach(sub => {
          if (sub.status === 'pending') {
            showNotification(`📬 New submission from ${sub.fullName || 'Student'}`);
            playNotificationSound();
            ringBell();
          }
        });
      }

      submissions = normalized;
      lastFetchCount = normalized.length;
      saveSubmissions();
      renderSubmissionsList();
      updateNotificationBadge();
      updateLastRefreshedLabel();
      if (manual) showNotification('✅ Submissions up to date');
    } else {
      console.error('Failed to fetch submissions');
      if (manual) showNotification('⚠️ Could not refresh submissions');
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    if (manual) showNotification('⚠️ Could not refresh submissions');
  } finally {
    isFetching = false;
    setRefreshLoading(false);
  }
}

function setRefreshLoading(loading) {
  const btn = document.getElementById('refreshBtn');
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="cod-refresh-icon">🔄</span> Refreshing…'
    : '<span class="cod-refresh-icon">🔄</span> Refresh';
}

function ringBell() {
  const bell = document.getElementById('notificationBell');
  if (!bell) return;
  bell.classList.remove('cod-ring');
  void bell.offsetWidth;
  bell.classList.add('cod-ring');
  setTimeout(() => bell.classList.remove('cod-ring'), 650);
}

function updateLastRefreshedLabel() {
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  const now = new Date();
  el.textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function playNotificationSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqFhYqF');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
}

function saveSubmissions() {
  localStorage.setItem('studentSubmissions', JSON.stringify(submissions));
  updateNotificationBadge();
}

function loadSubmissions() {
  const saved = localStorage.getItem('studentSubmissions');
  if (saved) {
    submissions = JSON.parse(saved);
    lastFetchCount = submissions.length;
    renderSubmissionsList();
    updateNotificationBadge();
  }
  fetchSubmissions();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  const pending = submissions.filter(s => s.status === 'pending' && !s.read).length;
  notificationCount = pending;
  if (badge) {
    if (pending > 0) {
      badge.textContent = pending;
      badge.style.display = 'flex';
      badge.classList.add('pulse');
    } else {
      badge.style.display = 'none';
      badge.classList.remove('pulse');
    }
  }
}

function addSubmission(data) {
  const normalized = normalizeSubmission(data);
  const exists = submissions.some(s => s.id === normalized.id ||
    (s.fullName === normalized.fullName && s.email === normalized.email));
  if (!exists) {
    submissions.unshift(normalized);
    lastFetchCount = submissions.length;
    saveSubmissions();
    updateNotificationBadge();
    showNotification(`📬 New submission from ${normalized.fullName}`);
    playNotificationSound();
    renderSubmissionsList();
  }
}

function showNotification(message) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">📬</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

async function updateStatus(id, status) {
  const methods = ['PUT', 'PATCH', 'POST'];
  let lastError = 'Unknown error';
  for (const method of methods) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, id })
      });
      if (response.ok) return { ok: true };
      lastError = `Server responded ${response.status} (${method})`;
      if (response.status !== 404 && response.status !== 405) break;
    } catch (error) {
      lastError = `Network error on ${method}: ${error.message}`;
    }
  }
  console.error('Error updating status:', lastError);
  return { ok: false, error: lastError };
}

async function deleteSubmission(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) return { ok: true };
    return { ok: false, error: `Server responded ${response.status}` };
  } catch (error) {
    console.error('Error deleting submission:', error);
    return { ok: false, error: `Network error: ${error.message}` };
  }
}

function setStatValue(el, newValue) {
  if (!el) return;
  const current = el.textContent;
  el.textContent = newValue;
  if (String(current) !== String(newValue)) {
    el.classList.remove('cod-pop');
    void el.offsetWidth;
    el.classList.add('cod-pop');
  }
}

// --- Render Submissions List ---
function renderSubmissionsList() {
  const list = document.getElementById('submissionsList');
  if (!list) return;

  const pending = submissions.filter(s => s.status === 'pending');
  const approved = submissions.filter(s => s.status === 'approved');
  const rejected = submissions.filter(s => s.status === 'rejected');

  const totalEl = document.getElementById('totalCount');
  const pendingEl = document.getElementById('pendingCount');
  const approvedEl = document.getElementById('approvedCount');

  setStatValue(totalEl, submissions.length);
  setStatValue(pendingEl, pending.length);
  setStatValue(approvedEl, approved.length);

  if (submissions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No submissions yet</p>
        <p style="font-size: 13px; color: #9ca3af;">Share the student form link to start receiving applications</p>
      </div>
    `;
    return;
  }

  list.innerHTML = submissions.map((sub, index) => {
    const photoUrl = resolvePhotoUrl(sub.photo);
    return `
    <div class="submission-card cod-card-enter ${sub.status === 'pending' ? 'pending' : ''} ${sub.status === 'approved' ? 'approved' : ''} ${sub.status === 'rejected' ? 'rejected' : ''}" data-id="${sub.id}" style="animation-delay:${Math.min(index, 8) * 60}ms">
      <div class="submission-header">
        <div class="submission-info">
          <span class="submission-number" style="display:inline-flex; align-items:center; justify-content:center; min-width:26px; height:20px; padding:0 6px; border-radius:999px; background:#eef1fb; color:#33396b; font-weight:700; font-size:11px;">#${index + 1}</span>
          <span class="submission-name">${sub.fullName}</span>
          <span class="submission-status ${sub.status}">
            ${sub.status === 'pending' ? '⏳ Pending' : sub.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
          </span>
        </div>
        <span class="submission-date">${new Date(sub.submittedAt).toLocaleString()}</span>
      </div>
      <div class="submission-details">
        <div class="detail-row" style="align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px; background:#fff4e0; color:#8a5a06; font-weight:700; font-size:12px; letter-spacing:.2px;">
            🆔 ${sub.studentId ? sub.studentId : 'Student ID not provided'}
          </span>
        </div>
        <div class="detail-row">
          <span><strong>📧 Email:</strong> ${sub.email || '—'}</span>
          <span><strong>📱 Phone:</strong> ${sub.phone || '—'}</span>
        </div>
        <div class="detail-row">
          <span><strong>📚 Course:</strong> ${sub.course || '—'}</span>
          <span><strong>🎯 Grade:</strong> ${sub.grade || '—'}</span>
        </div>
        ${sub.message ? `<div class="detail-row message-row"><strong>💬 Message:</strong> ${sub.message}</div>` : ''}
        ${sub.photo && sub.photo !== '' && sub.photo !== 'null' ? `
          <div class="detail-row" style="margin-top: 6px;">
            <img src="${photoUrl}" 
                 alt="${sub.fullName}'s photo" 
                 style="max-width: 80px; max-height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #e5e7eb; padding: 2px; background: #fff;" 
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 12px; color: #9ca3af; padding: 4px 8px; background: #f3f4f6; border-radius: 6px;\\'>📷 No photo</span>';" 
            />
          </div>
        ` : ''}
      </div>
      <div class="submission-actions">
        ${sub.status === 'pending' ? `
          <button class="action-btn approve-btn" onclick="window.handleAction('${sub.id}', 'approve')" title="Approve">
            ✅ Approve
          </button>
        ` : `
          <span class="action-status ${sub.status === 'approved' ? 'approved-text' : 'rejected-text'}">
            ${sub.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
          </span>
        `}
        <button class="action-btn certificate-btn" onclick="window.handleAction('${sub.id}', 'certificate')" title="Generate Certificate">
          🎓 Certificate
        </button>
        <button class="action-btn delete-btn" onclick="window.handleAction('${sub.id}', 'delete')" title="Delete">
          🗑️ Delete
        </button>
      </div>
    </div>
  `}).join('');
}

// --- Handle Actions ---
window.handleAction = async function(rawId, action) {
  const sub = submissions.find(s => String(s.id) === String(rawId));
  if (!sub) return;
  const id = sub.id;
  const cardEl = document.querySelector(`.submission-card[data-id="${id}"]`);

  switch(action) {
    case 'approve': {
      if (cardEl) cardEl.classList.add('cod-approving');
      const result = await updateStatus(id, 'approved');
      if (result.ok) {
        sub.status = 'approved';
        sub.read = true;
        saveSubmissions();
        renderSubmissionsList();
        updateNotificationBadge();
        showNotification(`✅ Approved: ${sub.fullName}`);
        playNotificationSound();
        requestAnimationFrame(() => {
          const freshCard = document.querySelector(`.submission-card[data-id="${id}"]`);
          if (freshCard) {
            freshCard.classList.add('cod-flash-approve');
            setTimeout(() => freshCard.classList.remove('cod-flash-approve'), 900);
          }
        });
      } else {
        if (cardEl) {
          cardEl.classList.remove('cod-approving');
          cardEl.classList.add('cod-shake-error');
          setTimeout(() => cardEl.classList.remove('cod-shake-error'), 500);
        }
        showNotification(`⚠️ Approve failed — ${result.error}`);
        console.error(`Approve failed for submission ${id}:`, result.error);
      }
      break;
    }
    case 'delete': {
      if (confirm(`Delete submission from ${sub.fullName}?`)) {
        if (cardEl) cardEl.classList.add('cod-removing');
        await new Promise(resolve => setTimeout(resolve, cardEl ? 240 : 0));
        const result = await deleteSubmission(id);
        if (result.ok) {
          submissions = submissions.filter(s => s.id !== id);
          lastFetchCount = submissions.length;
          saveSubmissions();
          renderSubmissionsList();
          updateNotificationBadge();
          showNotification(`🗑️ Deleted: ${sub.fullName}`);
          playNotificationSound();
        } else {
          if (cardEl) {
            cardEl.classList.remove('cod-removing');
            cardEl.classList.add('cod-shake-error');
            setTimeout(() => cardEl.classList.remove('cod-shake-error'), 500);
          }
          showNotification(`⚠️ Delete failed — ${result.error}`);
          console.error(`Delete failed for submission ${id}:`, result.error);
        }
      }
      break;
    }
    case 'certificate':
      state.recipient = sub.fullName;
      state.course = sub.course;
      state.grade = sub.grade;
      state.studentId = sub.studentId || '';
      state.photo = sub.photo ? resolvePhotoUrl(sub.photo) : state.photo;

      const recipientInput = document.querySelector('#in-recipient');
      const courseInput = document.querySelector('#in-course');
      const gradeInput = document.querySelector('#in-grade');
      const studentIdInput = document.querySelector('#in-studentId');

      if (recipientInput) recipientInput.value = sub.fullName;
      if (courseInput) courseInput.value = sub.course;
      if (gradeInput) gradeInput.value = sub.grade;
      if (studentIdInput) studentIdInput.value = sub.studentId || '';

      state.type = 'merit';
      renderDocuments();
      renderForm();
      renderPreview();

      showNotification(`🎓 Certificate ready for ${sub.fullName}`);
      document.querySelector('.stage').scrollIntoView({ behavior: 'smooth' });
      break;
  }
};

window.toggleNotifications = function() {
  const panel = document.getElementById('submissionsPanel');
  if (panel) {
    panel.classList.toggle('expanded');
  }
};

window.refreshSubmissions = function() {
  fetchSubmissions(true);
};

window.copyFormLink = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    const btns = document.querySelectorAll('[onclick*="copyFormLink"]');
    btns.forEach(btn => {
      const originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = originalText; }, 2000);
    });
  }).catch(() => {
    const input = document.querySelector('.form-link-container input');
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  });
};

function showFormLink() {
  const formUrl = 'https://codstudent.netlify.app/';
  if (document.querySelector('.form-link-container')) return;
  const container = document.createElement('div');
  container.className = 'form-link-container';
  container.innerHTML = `
    <div style="background: #f0f9ff; border: 1px solid #b3d9ff; border-radius: 12px; padding: 16px; margin: 8px 0;">
      <p style="font-size: 14px; font-weight: 600; color: #1a2240; margin: 0 0 8px 0;">
        📤 Student Submission Form
      </p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <input type="text" value="${formUrl}" readonly
               style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; background: #fff; min-width: 150px;" />
        <button onclick="window.copyFormLink('${formUrl}')"
                style="padding: 8px 16px; border: none; border-radius: 8px; background: #0798d1; color: #fff; cursor: pointer; font-weight: 600; white-space: nowrap;">
          Copy Link
        </button>
        <button onclick="window.open('${formUrl}', '_blank')"
                style="padding: 8px 16px; border: none; border-radius: 8px; background: #10b981; color: #fff; cursor: pointer; font-weight: 600; white-space: nowrap;">
          Open Form
        </button>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin: 6px 0 0 0;">
        Share this link with students to collect submissions.
      </p>
    </div>
  `;
  const panel = document.querySelector('.panel');
  const notificationBell = document.querySelector('.notification-bell-wrapper');
  if (panel && notificationBell) {
    panel.insertBefore(container, notificationBell.nextSibling);
  }
}

// --- Animation styles ---
function injectAnimationStyles() {
  if (document.getElementById('cod-animations')) return;
  const style = document.createElement('style');
  style.id = 'cod-animations';
  style.textContent = `
    @keyframes cod-toast-in {
      from { opacity: 0; transform: translateX(48px) scale(.94); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    .notification-toast { animation: cod-toast-in .38s cubic-bezier(.34,1.56,.64,1) both; }

    @keyframes cod-bell-ring {
      0%, 100% { transform: rotate(0deg); }
      15% { transform: rotate(16deg); }
      30% { transform: rotate(-14deg); }
      45% { transform: rotate(10deg); }
      60% { transform: rotate(-8deg); }
      75% { transform: rotate(4deg); }
      90% { transform: rotate(-2deg); }
    }
    .notification-bell.cod-ring { animation: cod-bell-ring .6s ease; transform-origin: top center; }
    .notification-bell { transition: transform .15s ease; }
    .notification-bell:hover { transform: scale(1.08); }

    @keyframes cod-badge-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
      50% { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
    }
    .notification-badge.pulse { animation: cod-badge-pulse 1.5s ease-in-out infinite; }

    @keyframes cod-card-enter {
      from { opacity: 0; transform: translateY(16px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .submission-card.cod-card-enter {
      animation: cod-card-enter .45s cubic-bezier(.22,1,.36,1) both;
    }
    .submission-card {
      transition: transform .25s ease, box-shadow .25s ease, opacity .25s ease, background-color .6s ease;
    }
    .submission-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(20, 25, 60, .10);
    }
    .submission-card.cod-removing {
      opacity: 0;
      transform: translateX(36px) scale(.95);
      pointer-events: none;
    }
    .submission-card.cod-approving {
      opacity: .6;
      transform: scale(.99);
    }
    @keyframes cod-flash-approve {
      0% { background-color: #e7fbee; }
      100% { background-color: transparent; }
    }
    .submission-card.cod-flash-approve { animation: cod-flash-approve .9s ease; }

    .action-btn {
      transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease, filter .15s ease;
    }
    .action-btn:hover { transform: translateY(-2px) scale(1.04); filter: brightness(1.06); }
    .action-btn:active { transform: translateY(0) scale(.93); }

    .document-option, .action-status {
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .document-option:hover { transform: translateX(2px); }
    .document-option.active { animation: cod-card-enter .3s ease both; }

    .refresh-btn {
      transition: transform .15s ease, filter .15s ease;
    }
    .refresh-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
    .refresh-btn:active:not(:disabled) { transform: scale(.95); }
    @keyframes cod-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .refresh-btn:disabled .cod-refresh-icon {
      display: inline-block;
      animation: cod-spin .8s linear infinite;
    }

    .preview, .document-svg { transition: opacity .25s ease, transform .25s ease; }

    @keyframes cod-fade-in { from { opacity: 0; } to { opacity: 1; } }
    #submissionsList { animation: cod-fade-in .3s ease both; }

    @keyframes cod-shake-error {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(5px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(3px); }
    }
    .submission-card.cod-shake-error {
      animation: cod-shake-error .45s ease;
      box-shadow: 0 0 0 2px rgba(239,68,68,.35) !important;
    }

    @keyframes cod-stat-pop {
      0% { transform: scale(1); }
      45% { transform: scale(1.22); }
      100% { transform: scale(1); }
    }
    .stat-number { display: inline-block; transition: color .2s ease; }
    .stat-number.cod-pop { animation: cod-stat-pop .35s cubic-bezier(.34,1.56,.64,1); }

    .submissions-panel {
      transition: max-height .4s cubic-bezier(.22,1,.36,1), opacity .3s ease;
    }

    @keyframes cod-badge-in {
      from { opacity: 0; transform: scale(.85); }
      to { opacity: 1; transform: scale(1); }
    }
    .submission-details > .detail-row:first-child span { animation: cod-badge-in .3s ease both; }

    .app-shell { transition: opacity .5s ease; }
  `;
  document.head.appendChild(style);
}
injectAnimationStyles();

// --- App HTML ---
app.innerHTML = `
  <div id="loader" class="loader" aria-label="Loading certificate studio">
    <div class="loader-mark">
      <img src="/images/logo.png" alt="Clan of David Logo" style="width:50px; height:50px; object-fit:contain;" />
    </div>
    <div class="loader-text">
      <span id="typewriter-text"></span>
      <span class="cursor">|</span>
    </div>
    <div class="loader-bar"><span></span></div>
    <p>Preparing your document studio</p>
  </div>

  <div class="app-shell" id="app-shell">
    <aside class="panel">
      <div class="brand">
        <div class="brand-mark">
          <img src="/images/logo.png" alt="Clan of David Logo" style="width:32px; height:32px; object-fit:contain;" />
        </div>
        <div>
          <strong>Document Studio</strong>
          <small>Clan of David art And Music Academy</small>
        </div>
      </div>

      <div class="notification-bell-wrapper">
        <button class="notification-bell" id="notificationBell" onclick="window.toggleNotifications()">
          🔔
          <span class="notification-badge" id="notificationBadge">0</span>
        </button>
        <span class="notification-label">Submissions</span>
      </div>

      <div class="panel-heading">
        <p class="eyebrow">Create a document</p>
        <h1>Choose a template</h1>
        <p class="hint">Enter the details, add your images, then download a finished document.</p>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-number" id="totalCount">0</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item pending-stat">
          <span class="stat-number" id="pendingCount">0</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-item approved-stat">
          <span class="stat-number" id="approvedCount">0</span>
          <span class="stat-label">Approved</span>
        </div>
      </div>

      <div class="document-list" id="document-list"></div>
      <form class="form" id="form" autocomplete="off"></form>
    </aside>

    <main class="stage">
      <div class="submissions-panel" id="submissionsPanel">
        <div class="panel-header" onclick="window.toggleNotifications()">
          <h3>📋 Student Submissions</h3>
          <div class="panel-header-actions" onclick="event.stopPropagation();">
            <span class="last-updated" id="lastUpdated"></span>
            <button class="refresh-btn" id="refreshBtn" onclick="window.refreshSubmissions();">🔄 Refresh</button>
          </div>
        </div>
        <div id="submissionsList"></div>
      </div>

      <div class="stage-top">
        <div>
          <p class="eyebrow">Live preview</p>
          <h2 id="preview-title">Certificate of Merit</h2>
        </div>
        <span class="status"><i></i>Ready to download</span>
      </div>
      <div class="preview" id="preview"></div>
    </main>
  </div>

  <div id="notificationContainer"></div>
`;

// Get DOM elements after app is rendered
const loader = document.querySelector('#loader');
const shell = document.querySelector('#app-shell');
const list = document.querySelector('#document-list');
const form = document.querySelector('#form');
const preview = document.querySelector('#preview');
const previewTitle = document.querySelector('#preview-title');

// --- Typewriter Animation ---
function typewriterAnimation() {
  const textElement = document.getElementById('typewriter-text');
  const fullText = 'CLAN OF DAVID ACADEMY';
  let index = 0;
  let isDeleting = false;

  function type() {
    if (!textElement) return;
    if (!isDeleting) {
      textElement.textContent = fullText.substring(0, index + 1);
      index++;
      if (index === fullText.length) {
        setTimeout(() => {
          isDeleting = true;
          setTimeout(type, 300);
        }, 2000);
        return;
      }
      const delay = 30 + Math.random() * 30;
      setTimeout(type, delay);
    } else {
      textElement.textContent = fullText.substring(0, index - 1);
      index--;
      if (index === 0) {
        isDeleting = false;
        setTimeout(type, 1000);
        return;
      }
      setTimeout(type, 15 + Math.random() * 20);
    }
  }
  setTimeout(type, 500);
}

// --- Rest of the functions ---
function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);
}

function value(id, fallback) {
  return escapeXml(state[id].trim() || fallback);
}

function logoSvg(x, y, width = 100, height = 82) {
  if (state.logo && state.logo !== '') {
    return `<image href="${state.logo}" x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return `<g transform="translate(${x} ${y})"><rect x="-35" y="-32" width="70" height="64" rx="3" fill="#fff" stroke="#2923b9" stroke-width="4"/><text y="-4" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#2521ad">COD</text><text y="14" text-anchor="middle" font-family="Arial" font-size="7" font-weight="700" fill="#e91b78">ART &amp; MUSIC</text></g>`;
}

const certificateCopy = {
  merit: {
    title: 'Certificate of Merit',
    seal: 'MERIT',
    presentedLine: 'This certificate is proudly presented to',
    completionLine: 'For the successful completion of',
    showGrade: true,
    showYear: true,
    // REMOVED: closingLine: 'And has qualified for the next grade',
    closingLine: '', // empty – line will not be rendered
  },
  completion: {
    title: 'Certificate of Completion',
    seal: 'COMPLETION',
    presentedLine: 'This certificate is proudly awarded to',
    completionLine: 'For the successful completion of',
    showGrade: false,
    showYear: true,
    // REMOVED: closingLine: 'And has qualified for the next grade',
    closingLine: '',
  },
  attendance: {
    title: 'Certificate of Attendance',
    seal: 'ATTENDANCE',
    presentedLine: 'This certificate is proudly presented to',
    completionLine: 'For dedicated attendance and participation in',
    showGrade: true,
    showYear: false,
    closingLine: 'In recognition of their consistent commitment',
  },
}

function signatureBlock(x, dy, signatureKey, name, fallback) {
  const signature = state[signatureKey];
  const signatureImage = signature
    ? `<image href="${signature}" x="${x - 75}" y="${dy - 52}" width="150" height="44" preserveAspectRatio="xMidYMid meet"/>`
    : '';
  return `${signatureImage}<line x1="${x - 75}" y1="${dy}" x2="${x + 75}" y2="${dy}" stroke="#b9760b" stroke-width="2"/><text x="${x}" y="${dy + 22}" text-anchor="middle">${value(name, fallback)}</text>`;
}

function certificateSvg(kind) {
  const copy = certificateCopy[kind] || certificateCopy.merit;
  const { title, seal, presentedLine, completionLine, showGrade, showYear, closingLine } = copy;

  const courseLine = showGrade
    ? `Grade <tspan id="svg-grade">${value('grade', '___')}</tspan> of <tspan id="svg-course">${value('course', '_______')}</tspan> Course`
    : `<tspan id="svg-course">${value('course', '_______')}</tspan> Course`;

  const dateLine = showYear
    ? `on this day <tspan id="svg-day">${value('day', '__')}</tspan> of year <tspan id="svg-year">${value('year', '____')}</tspan>`
    : `on this day <tspan id="svg-day">${value('day', '__')}</tspan>`;

  // Conditionally render the closing line only if it has content
  const closingLineElement = closingLine
    ? `<text y="556" font-family="Arial" font-size="20" font-weight="700" fill="#2a3192">${closingLine}</text>`
    : '';

  return `<svg class="document-svg" id="certificate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 790" role="img" aria-label="${title}">
    <defs><linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17175c"/><stop offset=".5" stop-color="#252a91"/><stop offset="1" stop-color="#071271"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9c6c0f"/><stop offset=".5" stop-color="#fff19a"/><stop offset="1" stop-color="#b7801d"/></linearGradient><radialGradient id="red"><stop stop-color="#d53a32"/><stop offset="1" stop-color="#9c1515"/></radialGradient></defs>
    <rect width="1120" height="790" fill="#fff"/><path d="M0 0H336L198 395l138 395H0Z" fill="url(#ribbon)"/><path d="M130 0H336L198 395l138 395H130Z" fill="#2336af" opacity=".3"/><path d="M0 0h60l138 395L60 790H0Z" fill="#fff" opacity=".05"/><path d="M336 0 198 395l138 395" fill="none" stroke="url(#gold)" stroke-width="4"/>
    <g transform="translate(238 346)"><circle r="62" fill="url(#gold)" stroke="#865a10" stroke-width="2"/><circle r="44" fill="none" stroke="#865a10" stroke-width="3"/><circle r="34" fill="#f7da62" stroke="#ffe78c"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="9" font-weight="700" fill="#754b05">${seal}</text></g>
    <g fill="none" stroke="#4c91f2" stroke-width="1.4" opacity=".55" transform="translate(120 170)">${Array.from({ length: 11 }, (_, i) => `<path d="M-30 ${i * 6}C100 ${-84 + i * 6} 250 ${-82 + i * 6} 310 ${28 + i * 6}S212 ${240 + i * 6} 28 ${154 + i * 6}"/>`).join('')}</g>
    <g fill="none" stroke="#4c91f2" stroke-width="1.4" opacity=".5" transform="translate(740 470)">${Array.from({ length: 9 }, (_, i) => `<path d="M${20 - i * 6} ${i * 6}C100 ${-142 + i * 6} 280 ${-170 + i * 6} 378 ${-62 + i * 6}S384 ${74 + i * 6} 286 ${100 + i * 6}"/>`).join('')}</g>
    <g transform="translate(560 0)" text-anchor="middle">${logoSvg(0, 92, 108, 86)}<text y="226" font-family="Georgia,serif" font-size="45" font-weight="700" fill="#282a8f">${title}</text><text y="280" font-family="Arial" font-size="20" fill="#ee2424">${presentedLine}</text><text id="svg-recipient" y="350" font-family="Georgia,serif" font-size="39" font-weight="700" fill="#1e1e1e">${value('recipient', 'Recipient Name')}</text><line x1="-210" y1="370" x2="210" y2="370" stroke="#1e1e1e"/><text y="414" font-family="Arial" font-size="17" font-weight="700">${completionLine}</text><text y="466" font-family="Arial" font-size="17">${courseLine}</text><text y="506" font-family="Arial" font-size="17">${dateLine}</text>${closingLineElement}<g transform="translate(0 690)" font-family="Georgia,serif" font-size="13">${signatureBlock(-225, 0, 'coordinatorSignature', 'coordinator', 'Training Coordinator')}${signatureBlock(225, 0, 'directorSignature', 'director', 'Director')}</g></g><g transform="translate(560 718)"><circle r="52" fill="url(#red)"/><circle r="40" fill="none" stroke="#781010"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="10" font-weight="700" fill="#fff">${seal}</text></g>
  </svg>`;
}

// ============================================
// ✅ IMPROVED ID CARD SVG WITH BETTER PHOTO POSITIONING
// ============================================
function idCardSvg() {
  let photoElement = '';
  if (state.photo && state.photo !== '') {
    photoElement = `
      <image 
        href="${state.photo}" 
        x="170" 
        y="186" 
        width="220" 
        height="220" 
        preserveAspectRatio="xMidYMid slice" 
        clip-path="url(#photo)"
      />`;
  } else {
    photoElement = `
      <circle cx="280" cy="296" r="100" fill="#edf0f6"/>
      <text x="280" y="292" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#9ca3af">PHOTO</text>
      <text x="280" y="312" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">(passport size)</text>
    `;
  }

  return `<svg class="document-svg id-svg" id="idcard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 760" role="img" aria-label="Student ID card">
    <defs>
      <linearGradient id="blue" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#182f88"/>
        <stop offset="1" stop-color="#2748ae"/>
      </linearGradient>
      <linearGradient id="pink" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#9b136c"/>
        <stop offset="1" stop-color="#e1198b"/>
      </linearGradient>
      <clipPath id="photo">
        <circle cx="280" cy="296" r="100"/>
      </clipPath>
    </defs>

    <rect width="1120" height="760" fill="#e9edf5"/>

    <!-- FRONT SIDE -->
    <g transform="translate(30 48)">
      <rect width="510" height="664" rx="16" fill="#fff" stroke="#d9deeb" stroke-width="2"/>
      <path d="M0 0h510v190c-135 25-287-15-510 18Z" fill="url(#blue)"/>
      <path d="M0 18c115 32 230-5 365 25 70 15 105 6 145-8v35C355 105 190 62 0 78Z" fill="#fff" opacity=".15"/>
      
      <!-- Logo -->
      <g transform="translate(255 65)">${logoSvg(0, 0, 85, 65)}</g>
      
      <!-- Title text -->
      <text x="255" y="148" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">CLAN OF DAVID</text>
      <text x="255" y="173" text-anchor="middle" font-family="Arial" font-size="14" fill="#fff">ART AND MUSIC ACADEMY</text>
      
      <!-- ✅ IMPROVED: Photo frame with better sizing and positioning -->
      <!-- Outer decorative ring -->
      <circle cx="280" cy="296" r="118" fill="#fff" stroke="#781f5e" stroke-width="6"/>
      
      <!-- Inner photo circle with lighter background -->
      <circle cx="280" cy="296" r="108" fill="#f0f4f9" stroke="#e0e5ed" stroke-width="2"/>
      
      <!-- Photo content with improved clipping and positioning -->
      <g clip-path="url(#photo)">
        ${state.photo && state.photo !== '' ? `
          <!-- ✅ IMPROVED: Better image sizing and centering -->
          <image 
            href="${state.photo}" 
            x="170" 
            y="186" 
            width="220" 
            height="220" 
            preserveAspectRatio="xMidYMid slice"
          />
        ` : `
          <circle cx="280" cy="296" r="100" fill="#edf0f6"/>
          <text x="280" y="292" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#9ca3af">PHOTO</text>
          <text x="280" y="312" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">(passport size)</text>
        `}
      </g>
      
      <!-- Details section -->
      <g font-family="Arial" font-size="18" fill="#172f83" font-weight="700">
        <text x="70" y="475">Name:</text>
        <text x="170" y="475" fill="#1e1e1e" font-weight="400">${value('recipient', '______________________')}</text>
        <line x1="168" y1="482" x2="440" y2="482" stroke="#1e1e1e" stroke-dasharray="2,2"/>
        
        <text x="70" y="525">Course:</text>
        <text x="170" y="525" fill="#1e1e1e" font-weight="400">${value('course', '______________________')}</text>
        <line x1="168" y1="532" x2="440" y2="532" stroke="#1e1e1e" stroke-dasharray="2,2"/>
        
        <text x="70" y="575">Grade:</text>
        <text x="170" y="575" fill="#1e1e1e" font-weight="400">${value('grade', '______________________')}</text>
        <line x1="168" y1="582" x2="440" y2="582" stroke="#1e1e1e" stroke-dasharray="2,2"/>
        
        <text x="55" y="625">Student ID:</text>
        <text x="180" y="625" fill="#1e1e1e" font-weight="400">${value('studentId', '______________________')}</text>
        <line x1="178" y1="632" x2="440" y2="632" stroke="#1e1e1e" stroke-dasharray="2,2"/>
      </g>
    </g>

    <!-- BACK SIDE -->
    <g transform="translate(580 48)">
      <rect width="510" height="664" rx="16" fill="#fff" stroke="#d9deeb" stroke-width="2"/>
      <path d="M0 0h510v105c-140 24-270-30-510 5Z" fill="url(#blue)"/>
      <path d="M0 570c160-50 280 38 510-10v154H0Z" fill="url(#blue)"/>
      <path d="M0 600c180-45 295 32 510-15v50C280 680 145 622 0 652Z" fill="url(#pink)"/>
      
      <text x="255" y="185" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">This is to certify that the person</text>
      <text x="255" y="215" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">whose name and photo appears</text>
      <text x="255" y="245" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">on the over leaf is a student of</text>
      
      <text x="255" y="315" text-anchor="middle" font-family="Arial" font-size="29" font-weight="700">CLAN OF DAVID</text>
      <text x="255" y="345" text-anchor="middle" font-family="Arial" font-size="18">ART AND MUSIC ACADEMY</text>
      
      <text x="255" y="405" text-anchor="middle" font-family="Arial" font-size="19">${value('phone', '+234 706 809 8651')}</text>
      
      <text x="255" y="465" text-anchor="middle" font-family="Arial" font-size="17">This card must be</text>
      <text x="255" y="492" text-anchor="middle" font-family="Arial" font-size="17">surrendered at the end of student session.</text>
      <text x="255" y="540" text-anchor="middle" font-family="Arial" font-size="17">If found please return to the address above</text>
      <text x="255" y="566" text-anchor="middle" font-family="Arial" font-size="17">or to the nearest police station.</text>
    </g>
  </svg>`;
}

function renderDocuments() {
  list.innerHTML = documentTypes.map(doc => `<button type="button" class="document-option ${state.type === doc.id ? 'active' : ''}" data-type="${doc.id}"><span class="option-icon">${doc.id === 'idcard' ? 'ID' : 'C'}</span><span><strong>${doc.label}</strong><small>${doc.short}</small></span><b>›</b></button>`).join('');
  list.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
    state.type = button.dataset.type;
    renderDocuments();
    renderForm();
    renderPreview();
  }));
}

function renderForm() {
  const isId = state.type === 'idcard';
  const fields = isId ? idFields : certificateFields;

  // ---- REMOVED signature upload fields ----
  // Only keep photo upload for ID card
  let uploadHtml = '';
  if (isId) {
    uploadHtml = `<div class="upload-grid">
      <label class="upload-field">
        <span>Passport Photo</span>
        <input id="photo-input" type="file" accept="image/*"/>
        <small style="color: #6b7280; font-size: 11px; margin-top: 4px;">Upload a clear passport-style photo</small>
      </label>
    </div>`;
  }
  // No signature uploads for certificates

  form.innerHTML = `${uploadHtml}${fields.map(([id, label, placeholder]) => `<label class="field"><span>${label}</span><input id="in-${id}" type="text" placeholder="${placeholder}" value="${state[id]}"/></label>`).join('')}<button type="button" id="download" class="download">Download ${isId ? 'ID card (PDF with front & back)' : 'certificate'}</button>`;

  fields.forEach(([id]) => {
    const input = document.querySelector(`#in-${id}`);
    if (input) {
      input.addEventListener('input', event => {
        state[id] = event.target.value;
        renderPreview();
      });
    }
  });

  // Photo input handler (only for ID card)
  const photoInput = document.querySelector('#photo-input');
  if (photoInput) photoInput.addEventListener('change', event => readImage(event, 'photo'));

  // ---- REMOVED signature input handlers ----

  const downloadBtn = document.querySelector('#download');
  if (downloadBtn) downloadBtn.addEventListener('click', downloadDocument);
}

function readImage(event, key) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    state[key] = String(reader.result);
    renderPreview();
  });
  reader.readAsDataURL(file);
}

function renderPreview() {
  const isId = state.type === 'idcard';
  previewTitle.textContent = isId ? 'Student ID Card' : (certificateCopy[state.type] || certificateCopy.merit).title;
  preview.style.opacity = '0';
  preview.style.transform = 'translateY(6px)';
  preview.innerHTML = isId ? idCardSvg() : certificateSvg(state.type);
  requestAnimationFrame(() => {
    preview.style.opacity = '1';
    preview.style.transform = 'translateY(0)';
  });
}

async function downloadDocument() {
  const isId = state.type === 'idcard';
  if (isId) {
    await downloadIdCardPDF();
  } else {
    await downloadCertificatePNG();
  }
}

async function downloadIdCardPDF() {
  if (typeof html2pdf === 'undefined') {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
  }

  const svg = preview.querySelector('svg');
  const clone = svg.cloneNode(true);
  const viewBox = svg.viewBox.baseVal;
  clone.setAttribute('width', String(viewBox.width * 2));
  clone.setAttribute('height', String(viewBox.height * 2));

  const svgString = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  image.src = url;

  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });

  const canvas = document.createElement('canvas');
  canvas.width = viewBox.width * 2;
  canvas.height = viewBox.height * 2;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  const imgData = canvas.toDataURL('image/png');

  const pdfElement = document.createElement('div');
  pdfElement.style.width = '595px';
  pdfElement.style.padding = '20px';
  pdfElement.style.backgroundColor = '#ffffff';
  pdfElement.style.fontFamily = 'Arial, sans-serif';

  pdfElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 10px;">
      <h3 style="color: #182f88; margin: 0;">CLAN OF DAVID ACADEMY</h3>
      <p style="margin: 0; color: #666; font-size: 12px;">Student ID Card - Front</p>
    </div>
    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
      <img src="${imgData}" style="width: 100%; max-width: 500px; border: 1px solid #ddd; border-radius: 8px;" />
    </div>
    <div style="text-align: center; margin: 15px 0; border-top: 2px dashed #ccc; padding-top: 15px;">
      <h3 style="color: #182f88; margin: 0;">CLAN OF DAVID ACADEMY</h3>
      <p style="margin: 0; color: #666; font-size: 12px;">Student ID Card - Back</p>
    </div>
    <div style="display: flex; justify-content: center; margin-bottom: 10px;">
      <img src="${imgData}" style="width: 100%; max-width: 500px; border: 1px solid #ddd; border-radius: 8px;" />
    </div>
    <div style="text-align: center; margin-top: 10px; color: #999; font-size: 10px;">
      <p style="margin: 2px 0;">This card must be surrendered at the end of student session.</p>
      <p style="margin: 2px 0;">If found please return to the address above or to the nearest police station.</p>
    </div>
  `;

  html2pdf()
    .set({
      margin: 10,
      filename: `ID-Card-${state.recipient || 'Student'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(pdfElement)
    .save();
}

async function downloadCertificatePNG() {
  const svg = preview.querySelector('svg');
  const clone = svg.cloneNode(true);
  const viewBox = svg.viewBox.baseVal;
  clone.setAttribute('width', String(viewBox.width * 2));
  clone.setAttribute('height', String(viewBox.height * 2));
  const svgString = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  image.src = url;
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
  const canvas = document.createElement('canvas');
  canvas.width = viewBox.width * 2;
  canvas.height = viewBox.height * 2;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    const base = (state.recipient || state.type).trim().toLowerCase().replace(/\s+/g, '-') || state.type;
    link.download = `${base}-${state.type}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }, 'image/png');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// --- Initialize everything ---
async function init() {
  // Load default signatures before rendering
  await loadDefaultSignatures();

  renderDocuments();
  renderForm();
  renderPreview();
  typewriterAnimation();
  showFormLink();
  loadSubmissions();
}

init();

// Auto-refresh every 10 seconds
setInterval(() => fetchSubmissions(false), 10000);

window.setTimeout(() => {
  loader.classList.add('hidden');
  shell.classList.add('ready');
}, 5000);