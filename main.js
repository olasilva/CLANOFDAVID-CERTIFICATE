import './style.css'

const app = document.querySelector('#app')
const year = String(new Date().getFullYear())

const documentTypes = [
  { id: 'merit', label: 'Certificate of Merit', short: 'Merit certificate' },
  { id: 'excellence', label: 'Certificate of Excellence', short: 'Excellence certificate' },
  { id: 'idcard', label: 'Student ID Card', short: 'Student ID card' },
]

const state = {
  type: 'merit',
  logo: '/images/logo.png', // Default logo path
  photo: '',
  recipient: '',
  grade: '',
  course: '',
  day: '',
  year,
  coordinator: '',
  director: '',
  studentId: '',
  phone: '',
}

const certificateFields = [
  ['recipient', 'Recipient name', 'e.g. Sarah Johnson'],
  ['grade', 'Grade', 'e.g. 5'],
  ['course', 'Course', 'e.g. Piano'],
  ['day', 'Day', 'e.g. 12'],
  ['year', 'Year', year],
  ['coordinator', 'Training coordinator', 'Coordinator name'],
  ['director', 'Director', 'Director name'],
]

const idFields = [
  ['recipient', 'Student name', 'e.g. Sarah Johnson'],
  ['course', 'Course', 'e.g. Piano'],
  ['grade', 'Grade', 'e.g. 5'],
  ['studentId', 'Student ID', 'e.g. COD-2026-001'],
  ['phone', 'Phone number', 'e.g. +234 706 809 8651'],
]

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
        <div><strong>Document Studio</strong><small>Clan of David Academy</small></div>
      </div>
      <div class="panel-heading"><p class="eyebrow">Create a document</p><h1>Choose a template</h1><p class="hint">Enter the details, add your images, then download a finished document.</p></div>
      <div class="document-list" id="document-list"></div>
      <form class="form" id="form" autocomplete="off"></form>
    </aside>
    <main class="stage">
      <div class="stage-top"><div><p class="eyebrow">Live preview</p><h2 id="preview-title">Certificate of Merit</h2></div><span class="status"><i></i>Ready to download</span></div>
      <div class="preview" id="preview"></div>
    </main>
  </div>
`

const loader = document.querySelector('#loader')
const shell = document.querySelector('#app-shell')
const list = document.querySelector('#document-list')
const form = document.querySelector('#form')
const preview = document.querySelector('#preview')
const previewTitle = document.querySelector('#preview-title')

// --- Typewriter Animation ---
function typewriterAnimation() {
  const textElement = document.getElementById('typewriter-text')
  const fullText = 'CLAN OF DAVID ACADEMY'
  let index = 0
  let isDeleting = false
  
  function type() {
    if (!textElement) return
    
    if (!isDeleting) {
      textElement.textContent = fullText.substring(0, index + 1)
      index++
      
      if (index === fullText.length) {
        setTimeout(() => {
          isDeleting = true
          setTimeout(type, 300)
        }, 2000)
        return
      }
      
      const delay = 30 + Math.random() * 30
      setTimeout(type, delay)
    } else {
      textElement.textContent = fullText.substring(0, index - 1)
      index--
      
      if (index === 0) {
        isDeleting = false
        setTimeout(type, 1000)
        return
      }
      
      setTimeout(type, 15 + Math.random() * 20)
    }
  }
  
  setTimeout(type, 500)
}

// --- Rest of the functions ---
function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character])
}

function value(id, fallback) {
  return escapeXml(state[id].trim() || fallback)
}

function logoSvg(x, y, width = 100, height = 82) {
  if (state.logo && state.logo !== '') {
    return `<image href="${state.logo}" x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`
  }
  return `<g transform="translate(${x} ${y})"><rect x="-35" y="-32" width="70" height="64" rx="3" fill="#fff" stroke="#2923b9" stroke-width="4"/><text y="-4" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#2521ad">COD</text><text y="14" text-anchor="middle" font-family="Arial" font-size="7" font-weight="700" fill="#e91b78">ART &amp; MUSIC</text></g>`
}

function certificateSvg(kind) {
  const title = kind === 'excellence' ? 'Certificate of Excellence' : 'Certificate of Merit'
  const seal = kind === 'excellence' ? 'EXCELLENCE' : 'MERIT'
  return `<svg class="document-svg" id="certificate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 790" role="img" aria-label="${title}">
    <defs><linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17175c"/><stop offset=".5" stop-color="#252a91"/><stop offset="1" stop-color="#071271"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9c6c0f"/><stop offset=".5" stop-color="#fff19a"/><stop offset="1" stop-color="#b7801d"/></linearGradient><radialGradient id="red"><stop stop-color="#d53a32"/><stop offset="1" stop-color="#9c1515"/></radialGradient></defs>
    <rect width="1120" height="790" fill="#fff"/><path d="M0 0H336L198 395l138 395H0Z" fill="url(#ribbon)"/><path d="M130 0H336L198 395l138 395H130Z" fill="#2336af" opacity=".3"/><path d="M0 0h60l138 395L60 790H0Z" fill="#fff" opacity=".05"/><path d="M336 0 198 395l138 395" fill="none" stroke="url(#gold)" stroke-width="4"/>
    <g transform="translate(238 346)"><circle r="62" fill="url(#gold)" stroke="#865a10" stroke-width="2"/><circle r="44" fill="none" stroke="#865a10" stroke-width="3"/><circle r="34" fill="#f7da62" stroke="#ffe78c"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="9" font-weight="700" fill="#754b05">${seal}</text></g>
    <g fill="none" stroke="#4c91f2" stroke-width="1.4" opacity=".55" transform="translate(120 170)">${Array.from({ length: 11 }, (_, i) => `<path d="M-30 ${i * 6}C100 ${-84 + i * 6} 250 ${-82 + i * 6} 310 ${28 + i * 6}S212 ${240 + i * 6} 28 ${154 + i * 6}"/>`).join('')}</g>
    <g fill="none" stroke="#4c91f2" stroke-width="1.4" opacity=".5" transform="translate(740 470)">${Array.from({ length: 9 }, (_, i) => `<path d="M${20 - i * 6} ${i * 6}C100 ${-142 + i * 6} 280 ${-170 + i * 6} 378 ${-62 + i * 6}S384 ${74 + i * 6} 286 ${100 + i * 6}"/>`).join('')}</g>
    <g transform="translate(560 0)" text-anchor="middle">${logoSvg(0, 92, 108, 86)}<text y="226" font-family="Georgia,serif" font-size="45" font-weight="700" fill="#282a8f">${title}</text><text y="280" font-family="Arial" font-size="20" fill="#ee2424">This certificate is proudly presented to</text><text id="svg-recipient" y="350" font-family="Georgia,serif" font-size="39" font-weight="700" fill="#1e1e1e">${value('recipient', 'Recipient Name')}</text><line x1="-210" y1="370" x2="210" y2="370" stroke="#1e1e1e"/><text y="414" font-family="Arial" font-size="17" font-weight="700">For the successful completion of</text><text y="466" font-family="Arial" font-size="17">Grade <tspan id="svg-grade">${value('grade', '___')}</tspan> of <tspan id="svg-course">${value('course', '_______')}</tspan> Course</text><text y="506" font-family="Arial" font-size="17">on this day <tspan id="svg-day">${value('day', '__')}</tspan> of year <tspan id="svg-year">${value('year', '____')}</tspan></text><text y="556" font-family="Arial" font-size="20" font-weight="700" fill="#2a3192">And has qualified for the next grade</text><g transform="translate(0 690)" font-family="Georgia,serif" font-size="13"><line x1="-300" y1="0" x2="-150" y2="0" stroke="#b9760b" stroke-width="2"/><text id="svg-coordinator" x="-225" y="22">${value('coordinator', 'Training Coordinator')}</text><line x1="150" y1="0" x2="300" y2="0" stroke="#b9760b" stroke-width="2"/><text id="svg-director" x="225" y="22">${value('director', 'Director')}</text></g></g><g transform="translate(560 718)"><circle r="52" fill="url(#red)"/><circle r="40" fill="none" stroke="#781010"/><text text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="10" font-weight="700" fill="#fff">${seal}</text></g>
  </svg>`
}

function idCardSvg() {
  // Process photo to be properly displayed as passport
  let photoElement = ''
  if (state.photo && state.photo !== '') {
    // Use the image directly with preserveAspectRatio for passport-style
    photoElement = `<image href="${state.photo}" x="172" y="188" width="216" height="216" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>`
  } else {
    photoElement = `<circle cx="280" cy="296" r="108" fill="#edf0f6"/><text x="280" y="302" text-anchor="middle" font-family="Arial" font-size="24" fill="#9ca3af">PHOTO</text>`
  }
  
  return `<svg class="document-svg id-svg" id="idcard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 760" role="img" aria-label="Student ID card">
    <defs><linearGradient id="blue" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#182f88"/><stop offset="1" stop-color="#2748ae"/></linearGradient><linearGradient id="pink" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9b136c"/><stop offset="1" stop-color="#e1198b"/></linearGradient><clipPath id="photo"><circle cx="280" cy="296" r="108"/></clipPath></defs>
    <rect width="1120" height="760" fill="#e9edf5"/><g transform="translate(30 48)"><rect width="510" height="664" rx="16" fill="#fff" stroke="#d9deeb" stroke-width="2"/><path d="M0 0h510v220c-135 25-287-15-510 18Z" fill="url(#blue)"/><path d="M0 18c115 32 230-5 365 25 70 15 105 6 145-8v45C355 105 190 62 0 78Z" fill="#fff" opacity=".15"/><g transform="translate(255 82)">${logoSvg(0, 0, 106, 78)}</g><text x="255" y="165" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#fff">CLAN OF DAVID</text><text x="255" y="194" text-anchor="middle" font-family="Arial" font-size="17" fill="#fff">ART AND MUSIC ACADEMY</text><circle cx="280" cy="296" r="116" fill="#fff" stroke="#781f5e" stroke-width="8"/><g clip-path="url(#photo)">${photoElement}</g><g font-family="Arial" font-size="20" fill="#172f83" font-weight="700"><text x="82" y="475">Name:</text><line x1="178" y1="480" x2="440" y2="480" stroke="#1e1e1e"/><text id="id-name" x="184" y="475" fill="#1e1e1e" font-weight="400">${value('recipient', '')}</text><text x="82" y="530">Course:</text><line x1="190" y1="535" x2="440" y2="535" stroke="#1e1e1e"/><text id="id-course" x="196" y="530" fill="#1e1e1e" font-weight="400">${value('course', '')}</text><text x="82" y="585">Grade:</text><line x1="178" y1="590" x2="440" y2="590" stroke="#1e1e1e"/><text id="id-grade" x="184" y="585" fill="#1e1e1e" font-weight="400">${value('grade', '')}</text><text x="55" y="640">Student ID:</text><line x1="190" y1="645" x2="440" y2="645" stroke="#1e1e1e"/><text id="id-studentId" x="196" y="640" fill="#1e1e1e" font-weight="400">${value('studentId', '')}</text></g></g><g transform="translate(580 48)"><rect width="510" height="664" rx="16" fill="#fff" stroke="#d9deeb" stroke-width="2"/><path d="M0 0h510v105c-140 24-270-30-510 5Z" fill="url(#blue)"/><path d="M0 570c160-50 280 38 510-10v154H0Z" fill="url(#blue)"/><path d="M0 600c180-45 295 32 510-15v50C280 680 145 622 0 652Z" fill="url(#pink)"/><text x="255" y="185" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">This is to certify that the person</text><text x="255" y="215" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">whose name and photo appears</text><text x="255" y="245" text-anchor="middle" font-family="Arial" font-size="18" fill="#333">on the over leaf is a student of</text><text x="255" y="315" text-anchor="middle" font-family="Arial" font-size="29" font-weight="700">CLAN OF DAVID</text><text x="255" y="345" text-anchor="middle" font-family="Arial" font-size="18">ART AND MUSIC ACADEMY</text><text x="255" y="405" text-anchor="middle" font-family="Arial" font-size="19">${value('phone', '+234 706 809 8651')}</text><text x="255" y="465" text-anchor="middle" font-family="Arial" font-size="17">This card must be</text><text x="255" y="492" text-anchor="middle" font-family="Arial" font-size="17">surrendered at the end of student session.</text><text x="255" y="540" text-anchor="middle" font-family="Arial" font-size="17">If found please return to the address above</text><text x="255" y="566" text-anchor="middle" font-family="Arial" font-size="17">or to the nearest police station.</text></g>
  </svg>`
}

function renderDocuments() {
  list.innerHTML = documentTypes.map(doc => `<button type="button" class="document-option ${state.type === doc.id ? 'active' : ''}" data-type="${doc.id}"><span class="option-icon">${doc.id === 'idcard' ? 'ID' : 'C'}</span><span><strong>${doc.label}</strong><small>${doc.short}</small></span><b>›</b></button>`).join('')
  list.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
    state.type = button.dataset.type
    renderDocuments()
    renderForm()
    renderPreview()
  }))
}

function renderForm() {
  const isId = state.type === 'idcard'
  const fields = isId ? idFields : certificateFields
  
  // Only show photo upload for ID card, no logo upload
  let uploadHtml = ''
  if (isId) {
    uploadHtml = `<div class="upload-grid">
      <label class="upload-field">
        <span>Passport Photo</span>
        <input id="photo-input" type="file" accept="image/*"/>
        <small style="color: #6b7280; font-size: 11px; margin-top: 4px;">Upload a clear passport-style photo</small>
      </label>
    </div>`
  }
  
  form.innerHTML = `${uploadHtml}${fields.map(([id, label, placeholder]) => `<label class="field"><span>${label}</span><input id="in-${id}" type="text" placeholder="${placeholder}" value="${state[id]}"/></label>`).join('')}<button type="button" id="download" class="download">Download ${isId ? 'ID card (PDF with front & back)' : 'certificate'}</button>`
  
  fields.forEach(([id]) => document.querySelector(`#in-${id}`).addEventListener('input', event => { state[id] = event.target.value; renderPreview() }))
  
  const photoInput = document.querySelector('#photo-input')
  if (photoInput) photoInput.addEventListener('change', event => readImage(event, 'photo'))
  
  document.querySelector('#download').addEventListener('click', downloadDocument)
}

function readImage(event, key) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.addEventListener('load', () => { 
    state[key] = String(reader.result)
    renderPreview() 
  })
  reader.readAsDataURL(file)
}

function renderPreview() {
  const isId = state.type === 'idcard'
  previewTitle.textContent = isId ? 'Student ID Card' : state.type === 'excellence' ? 'Certificate of Excellence' : 'Certificate of Merit'
  preview.innerHTML = isId ? idCardSvg() : certificateSvg(state.type)
}

async function downloadDocument() {
  const isId = state.type === 'idcard'
  
  if (isId) {
    await downloadIdCardPDF()
  } else {
    await downloadCertificatePNG()
  }
}

async function downloadIdCardPDF() {
  // Load html2pdf library dynamically
  if (typeof html2pdf === 'undefined') {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
  }
  
  // Get the SVG element and create a canvas from it
  const svg = preview.querySelector('svg')
  const clone = svg.cloneNode(true)
  const viewBox = svg.viewBox.baseVal
  clone.setAttribute('width', String(viewBox.width * 2))
  clone.setAttribute('height', String(viewBox.height * 2))
  
  const svgString = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }))
  const image = new Image()
  image.src = url
  
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject })
  
  // Create a canvas with the full ID card
  const canvas = document.createElement('canvas')
  canvas.width = viewBox.width * 2
  canvas.height = viewBox.height * 2
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  
  // Convert to data URL
  const imgData = canvas.toDataURL('image/png')
  
  // Create PDF with front and back
  const pdfElement = document.createElement('div')
  pdfElement.style.width = '595px'
  pdfElement.style.padding = '20px'
  pdfElement.style.backgroundColor = '#ffffff'
  pdfElement.style.fontFamily = 'Arial, sans-serif'
  
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
  `
  
  html2pdf()
    .set({
      margin: 10,
      filename: `ID-Card-${state.recipient || 'Student'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(pdfElement)
    .save()
}

async function downloadCertificatePNG() {
  const svg = preview.querySelector('svg')
  const clone = svg.cloneNode(true)
  const viewBox = svg.viewBox.baseVal
  clone.setAttribute('width', String(viewBox.width * 2))
  clone.setAttribute('height', String(viewBox.height * 2))
  const svgString = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }))
  const image = new Image()
  image.src = url
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject })
  const canvas = document.createElement('canvas')
  canvas.width = viewBox.width * 2
  canvas.height = viewBox.height * 2
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  canvas.toBlob(blob => {
    const link = document.createElement('a')
    const base = (state.recipient || state.type).trim().toLowerCase().replace(/\s+/g, '-') || state.type
    link.download = `${base}-${state.type}.png`
    link.href = URL.createObjectURL(blob)
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  }, 'image/png')
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

renderDocuments()
renderForm()
renderPreview()
typewriterAnimation()

window.setTimeout(() => { 
  loader.classList.add('hidden'); 
  shell.classList.add('ready') 
}, 5000)