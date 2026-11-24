/* ═══════════════════════════════════════════════
   NEXT GEN INNOVATIONS — App Logic
   Letterhead + Business Card Suite
   ═══════════════════════════════════════════════ */

// ── State ──
let currentVariant = 'english';
let cards = [];
let editingCardIndex = -1;
let currentPhotoData = null;

// ── Company Data ──
const COMPANY = {
    english: {
        name: 'NEXT GEN INNOVATIONS',
        nameSub: 'Nepal Private Limited',
        fullName: 'Next Gen Innovations Nepal Private Limited',
        address: 'Mahalaxmi Nagarpalika-5, Lalitpur, Nepal',
        regLabel: 'Reg No:',
        reg: '389207/82/83',
        panLabel: 'PAN:',
        pan: '623585229',
        refLabel: 'Ref No:',
        dateLabel: 'Date:',
        toLabel: 'To,',
        subjectLabel: 'Subject:',
        bodyPlaceholder: 'Type your letter content here...',
    },
    nepali: {
        name: 'नेक्स्ट जेन इनोभेसनस्',
        nameSub: 'नेपाल प्राइभेट लिमिटेड',
        fullName: 'नेक्स्ट जेन इनोभेसनस् नेपाल प्राइभेट लिमिटेड',
        address: 'महालक्ष्मी नगरपालिका-५, ललितपुर, नेपाल',
        regLabel: 'दर्ता नं.:',
        reg: '३८९२०७/८२/८३',
        panLabel: 'प्यान नं.:',
        pan: '६२३५८५२२९',
        refLabel: 'सन्दर्भ नं.:',
        dateLabel: 'मिति:',
        toLabel: 'श्री,',
        subjectLabel: 'विषय:',
        bodyPlaceholder: 'यहाँ पत्रको सामग्री लेख्नुहोस्...',
    }
};

// ══════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initVariantSelector();
    initFormSync();
    setTodayDate();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Activate clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const section = document.getElementById(tabId + '-section');
            if (section) {
                section.classList.add('active');
                section.style.animation = 'none';
                section.offsetHeight; // trigger reflow
                section.style.animation = '';
            }
        });
    });
}

// ══════════════════════════════════════
// VARIANT SELECTOR (English / Nepali / Mixed)
// ══════════════════════════════════════
function initVariantSelector() {
    const radios = document.querySelectorAll('input[name="variant"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentVariant = radio.value;
            applyVariant();
        });
    });
}

function applyVariant() {
    const nameEn = document.getElementById('lh-name-en');
    const nameNp = document.getElementById('lh-name-np');
    const addrEn = document.getElementById('lh-address-en');
    const addrNp = document.getElementById('lh-address-np');
    const body = document.getElementById('lh-body');

    // Labels
    const flRef = document.getElementById('fl-ref');
    const flDate = document.getElementById('fl-date');
    const flTo = document.getElementById('fl-to');

    // Header Details (Reg/PAN)
    const ffReg = document.getElementById('ff-reg');
    const ffPan = document.getElementById('ff-pan');

    switch (currentVariant) {
        case 'english':
            nameEn.style.display = 'block';
            nameNp.style.display = 'none';
            addrEn.style.display = 'block';
            addrNp.style.display = 'none';

            nameEn.innerHTML = '<span class="highlight">NEXT GEN</span> INNOVATIONS<br><span style="font-size:9pt;font-weight:600;letter-spacing:0.02em;">Nepal Private Limited</span>';

            flRef.textContent = COMPANY.english.refLabel;
            flDate.textContent = COMPANY.english.dateLabel;
            flTo.textContent = COMPANY.english.toLabel;
            ffReg.textContent = COMPANY.english.regLabel + ' ' + COMPANY.english.reg;
            ffPan.textContent = COMPANY.english.panLabel + ' ' + COMPANY.english.pan;

            body.classList.remove('nepali-placeholder');
            body.style.fontFamily = '';
            break;

        case 'nepali':
            nameEn.style.display = 'none';
            nameNp.style.display = 'block';
            addrEn.style.display = 'none';
            addrNp.style.display = 'block';

            nameNp.textContent = COMPANY.nepali.fullName;

            flRef.textContent = COMPANY.nepali.refLabel;
            flDate.textContent = COMPANY.nepali.dateLabel;
            flTo.textContent = COMPANY.nepali.toLabel;
            ffReg.textContent = COMPANY.nepali.regLabel + ' ' + COMPANY.nepali.reg;
            ffPan.textContent = COMPANY.nepali.panLabel + ' ' + COMPANY.nepali.pan;

            body.classList.add('nepali-placeholder');
            body.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
            break;

        case 'mixed':
            nameEn.style.display = 'block';
            nameNp.style.display = 'block';
            addrEn.style.display = 'block';
            addrNp.style.display = 'block';

            nameEn.innerHTML = '<span class="highlight">NEXT GEN</span> INNOVATIONS<br><span style="font-size:9pt;font-weight:600;letter-spacing:0.02em;">Nepal Private Limited</span>';
            nameNp.textContent = COMPANY.nepali.fullName;

            flRef.textContent = COMPANY.english.refLabel + ' / ' + COMPANY.nepali.refLabel;
            flDate.textContent = COMPANY.english.dateLabel + ' / ' + COMPANY.nepali.dateLabel;
            flTo.textContent = COMPANY.english.toLabel + ' / ' + COMPANY.nepali.toLabel;
            ffReg.textContent = 'Reg / दर्ता नं.: ' + COMPANY.english.reg;
            ffPan.textContent = 'PAN / प्यान: ' + COMPANY.english.pan;

            body.classList.remove('nepali-placeholder');
            body.style.fontFamily = '';
            break;
    }
}

// ══════════════════════════════════════
// FORM ↔ PREVIEW SYNC
// ══════════════════════════════════════
function initFormSync() {
    const fields = [
        { input: 'lh-ref', display: 'fv-ref' },
        { input: 'lh-date', display: 'fv-date' },
        { input: 'lh-subject', display: 'lh-subject-display', prefix: true },
        { input: 'lh-sig-name', display: 'lh-sig-name-display' },
        { input: 'lh-sig-desig', display: 'lh-sig-desig-display' },
    ];

    fields.forEach(({ input, display, prefix }) => {
        const inputEl = document.getElementById(input);
        const displayEl = document.getElementById(display);

        inputEl.addEventListener('input', () => {
            if (prefix && input === 'lh-subject') {
                const label = currentVariant === 'nepali' ? 'विषय: ' :
                              currentVariant === 'mixed' ? 'Subject / विषय: ' : 'Subject: ';
                displayEl.textContent = inputEl.value ? label + inputEl.value : '';
            } else {
                displayEl.textContent = inputEl.value;
            }
        });
    });

    // To field (textarea)
    document.getElementById('lh-to').addEventListener('input', (e) => {
        document.getElementById('fv-to').textContent = e.target.value;
    });

    // Business card form → preview sync
    const bcFields = [
        { input: 'bc-name', display: 'card-name-display', fallback: 'Your Name' },
        { input: 'bc-designation', display: 'card-desig-display', fallback: 'Designation' },
        { input: 'bc-phone', display: 'card-phone-display', fallback: '+977-98XXXXXXXX' },
        { input: 'bc-email', display: 'card-email-display', fallback: 'info@nextgeninnovations.com.np' },
    ];

    bcFields.forEach(({ input, display, fallback }) => {
        document.getElementById(input).addEventListener('input', (e) => {
            document.getElementById(display).textContent = e.target.value || fallback;
        });
    });
}

function setTodayDate() {
    const today = new Date();
    const formatted = today.getFullYear() + '/' +
        String(today.getMonth() + 1).padStart(2, '0') + '/' +
        String(today.getDate()).padStart(2, '0');
    document.getElementById('lh-date').value = formatted;
    document.getElementById('fv-date').textContent = formatted;
}

// ══════════════════════════════════════
// WORD (.doc) DOWNLOAD
// ══════════════════════════════════════

// Helper: convert image to base64 via canvas
function imageToBase64(imgSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                // Fallback: try fetching as blob
                fetch(imgSrc)
                    .then(r => r.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    })
                    .catch(() => resolve(''));
            }
        };
        img.onerror = () => resolve('');
        img.src = imgSrc;
    });
}

async function downloadAsWord() {
    showToast('⏳', 'Generating Word file...', 'success');

    // Convert logo to base64
    const logoBase64 = await imageToBase64('assets/Logo.png');

    // Get form values
    const refNo = document.getElementById('lh-ref').value || '';
    const dateVal = document.getElementById('lh-date').value || '';
    const toVal = document.getElementById('lh-to').value || '';
    const subjectVal = document.getElementById('lh-subject').value || '';
    const bodyContent = document.getElementById('lh-body').innerHTML || '';
    const sigName = document.getElementById('lh-sig-name').value || '';
    const sigDesig = document.getElementById('lh-sig-desig').value || '';

    // Get variant-specific data
    const isNepali = currentVariant === 'nepali';
    const isMixed = currentVariant === 'mixed';
    const data = isNepali ? COMPANY.nepali : COMPANY.english;

    // Build company name HTML
    let companyNameHTML = '';
    if (isNepali) {
        companyNameHTML = `<span style="font-size:14pt;font-weight:bold;color:#0D47A1;">${COMPANY.nepali.fullName}</span>`;
    } else if (isMixed) {
        companyNameHTML = `
            <span style="font-size:14pt;font-weight:bold;color:#0D47A1;">
                <span style="color:#1E88E5;">NEXT GEN</span> INNOVATIONS
            </span><br>
            <span style="font-size:9pt;font-weight:600;color:#0D47A1;">Nepal Private Limited</span><br>
            <span style="font-size:12pt;font-weight:bold;color:#0D47A1;">${COMPANY.nepali.fullName}</span>`;
    } else {
        companyNameHTML = `
            <span style="font-size:14pt;font-weight:bold;color:#0D47A1;">
                <span style="color:#1E88E5;">NEXT GEN</span> INNOVATIONS
            </span><br>
            <span style="font-size:9pt;font-weight:600;color:#0D47A1;">Nepal Private Limited</span>`;
    }

    // Build address HTML
    let addressHTML = '';
    if (isNepali) {
        addressHTML = `<span style="font-size:8pt;color:#4a5568;">${COMPANY.nepali.address}</span>`;
    } else if (isMixed) {
        addressHTML = `<span style="font-size:8pt;color:#4a5568;">${COMPANY.english.address}<br>${COMPANY.nepali.address}</span>`;
    } else {
        addressHTML = `<span style="font-size:8pt;color:#4a5568;">${COMPANY.english.address}</span>`;
    }

    // Build details HTML (Reg, PAN, contact)
    let regText = isNepali ? `${data.regLabel} ${data.reg}` : `Reg No: ${COMPANY.english.reg}`;
    let panText = isNepali ? `${data.panLabel} ${data.pan}` : `PAN: ${COMPANY.english.pan}`;
    if (isMixed) {
        regText = `Reg / ${COMPANY.nepali.regLabel} ${COMPANY.english.reg}`;
        panText = `PAN / ${COMPANY.nepali.panLabel} ${COMPANY.english.pan}`;
    }

    // Build field labels
    const refLabel = isNepali ? data.refLabel : isMixed ? 'Ref No / ' + COMPANY.nepali.refLabel : data.refLabel;
    const dateLabel = isNepali ? data.dateLabel : isMixed ? 'Date / ' + COMPANY.nepali.dateLabel : data.dateLabel;
    const toLabel = isNepali ? data.toLabel : isMixed ? 'To / ' + COMPANY.nepali.toLabel : data.toLabel;
    const subjectPrefix = isNepali ? 'विषय: ' : isMixed ? 'Subject / विषय: ' : 'Subject: ';

    // Logo image tag
    const logoImg = logoBase64
        ? `<img src="${logoBase64}" width="140" height="48" style="display:block;" alt="Logo">`
        : `<span style="font-size:16pt;font-weight:bold;color:#1E88E5;">NG</span>`;

    // Build the Word-compatible HTML using TABLES (Word loves tables)
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Letterhead - Next Gen Innovations</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
    @page {
        size: A4;
        margin: 15mm 15mm 12mm 15mm;
    }
    body {
        font-family: Calibri, Arial, sans-serif;
        font-size: 11pt;
        color: #1a1a2e;
        line-height: 1.6;
        margin: 0;
        padding: 0;
    }
    table {
        border-collapse: collapse;
    }
    td {
        vertical-align: top;
    }
    p {
        margin: 0 0 4pt 0;
    }
</style>
</head>
<body>

<!-- ═══ HEADER ═══ -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
    <tr>
        <td width="160" style="padding:8pt 12pt 8pt 0;vertical-align:middle;">
            ${logoImg}
        </td>
        <td style="text-align:right;padding:8pt 0;">
            ${companyNameHTML}
            <br>
            ${addressHTML}
            <br>
            <span style="font-size:7pt;color:#8896a6;">
                ${regText} &nbsp;|&nbsp; ${panText} &nbsp;|&nbsp; Tel: +977-XXXXXXXXXX
            </span>
            <br>
            <span style="font-size:7pt;color:#8896a6;">
                Email: info@nextgeninnovations.com.np &nbsp;|&nbsp; Web: nextgeninnovations.com.np
            </span>
        </td>
    </tr>
</table>

<!-- ═══ ACCENT LINE ═══ -->
<table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="border-top:3pt solid #1E88E5;font-size:1pt;line-height:1pt;">&nbsp;</td></tr>
    <tr><td style="border-top:1pt solid #e2e8f0;font-size:1pt;line-height:1pt;">&nbsp;</td></tr>
</table>

<!-- ═══ LETTER FIELDS ═══ -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14pt;">
    <tr>
        <td width="50%">
            <p style="font-size:10pt;margin-bottom:4pt;">
                <b style="color:#4a5568;">${refLabel}</b> ${refNo}
            </p>
        </td>
        <td width="50%" style="text-align:right;">
            <p style="font-size:10pt;margin-bottom:4pt;">
                <b style="color:#4a5568;">${dateLabel}</b> ${dateVal}
            </p>
        </td>
    </tr>
</table>

<!-- TO -->
<div style="margin-top:10pt;font-size:10pt;">
    <b style="color:#4a5568;">${toLabel}</b>
    <div style="margin-top:3pt;white-space:pre-line;">${toVal.replace(/\n/g, '<br>')}</div>
</div>

<!-- SUBJECT -->
${subjectVal ? `<p style="text-align:center;font-weight:bold;text-decoration:underline;font-size:11pt;margin:14pt 0;">${subjectPrefix}${subjectVal}</p>` : ''}

<!-- ═══ BODY ═══ -->
<div style="font-size:11pt;line-height:1.8;min-height:400pt;margin-top:8pt;">
${bodyContent || '<p>&nbsp;</p>'}
</div>

<!-- ═══ SIGNATURE ═══ -->
<div style="margin-top:60pt;">
    <table width="200" cellpadding="0" cellspacing="0">
        <tr><td style="border-top:1pt solid #1a1a2e;padding-top:4pt;">
            ${sigName ? `<p style="font-weight:bold;font-size:10pt;margin:0;">${sigName}</p>` : ''}
            ${sigDesig ? `<p style="font-size:9pt;color:#4a5568;margin:0;">${sigDesig}</p>` : ''}
        </td></tr>
    </table>
</div>

<!-- ═══ FOOTER LINE ═══ -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20pt;">
    <tr><td style="border-top:2pt solid #1E88E5;font-size:1pt;line-height:1pt;">&nbsp;</td></tr>
</table>

</body>
</html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const variantSuffix = currentVariant === 'nepali' ? '_nepali' :
                          currentVariant === 'mixed' ? '_mixed' : '_english';
    a.download = `NextGen_Letterhead${variantSuffix}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅', 'Word file downloaded!', 'success');
}

// ══════════════════════════════════════
// PRINT LETTERHEAD
// ══════════════════════════════════════
function printLetterhead() {
    // Temporarily hide business card section
    document.getElementById('business-card-section').style.display = 'none';
    document.getElementById('letterhead-section').classList.add('active');

    window.print();

    // Restore after print
    setTimeout(() => {
        document.getElementById('business-card-section').style.display = '';
    }, 500);

    showToast('🖨️', 'Print dialog opened!', 'success');
}

// ══════════════════════════════════════
// BUSINESS CARD — PHOTO UPLOAD
// ══════════════════════════════════════
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoData = e.target.result;
        const uploadArea = document.getElementById('photo-upload-area');
        uploadArea.innerHTML = `<img src="${currentPhotoData}" alt="Photo">
            <input type="file" id="bc-photo" accept="image/*" onchange="handlePhotoUpload(event)">`;

        // Update card preview
        const photoArea = document.getElementById('card-photo-area');
        photoArea.style.display = 'block';
        document.getElementById('card-photo-img').src = currentPhotoData;
    };
    reader.readAsDataURL(file);
}

// ══════════════════════════════════════
// BUSINESS CARD — CRUD
// ══════════════════════════════════════
function addOrUpdateCard() {
    const name = document.getElementById('bc-name').value.trim();
    const nameNp = document.getElementById('bc-name-np').value.trim();
    const designation = document.getElementById('bc-designation').value.trim();
    const department = document.getElementById('bc-department').value.trim();
    const phone = document.getElementById('bc-phone').value.trim();
    const email = document.getElementById('bc-email').value.trim();
    const address = document.getElementById('bc-address').value.trim();

    if (!name) {
        showToast('⚠️', 'Please enter a name!', 'error');
        document.getElementById('bc-name').focus();
        return;
    }

    const cardData = {
        name,
        nameNp,
        designation,
        department,
        phone,
        email,
        address,
        photo: currentPhotoData,
    };

    if (editingCardIndex >= 0) {
        cards[editingCardIndex] = cardData;
        editingCardIndex = -1;
        document.getElementById('btn-add-card').innerHTML = '➕ Add Card';
        showToast('✅', 'Card updated!', 'success');
    } else {
        cards.push(cardData);
        showToast('✅', `Card for ${name} added!`, 'success');
    }

    renderCardList();
    clearCardForm();
    if (cards.length > 0) {
        previewCard(cards.length - 1);
    }
}

function editCard(index) {
    const card = cards[index];
    document.getElementById('bc-name').value = card.name;
    document.getElementById('bc-name-np').value = card.nameNp || '';
    document.getElementById('bc-designation').value = card.designation;
    document.getElementById('bc-department').value = card.department || '';
    document.getElementById('bc-phone').value = card.phone;
    document.getElementById('bc-email').value = card.email;
    document.getElementById('bc-address').value = card.address || '';

    if (card.photo) {
        currentPhotoData = card.photo;
        const uploadArea = document.getElementById('photo-upload-area');
        uploadArea.innerHTML = `<img src="${card.photo}" alt="Photo">
            <input type="file" id="bc-photo" accept="image/*" onchange="handlePhotoUpload(event)">`;
    }

    editingCardIndex = index;
    document.getElementById('btn-add-card').innerHTML = '💾 Update Card';

    // Trigger preview sync
    ['bc-name', 'bc-designation', 'bc-phone', 'bc-email'].forEach(id => {
        document.getElementById(id).dispatchEvent(new Event('input'));
    });

    previewCard(index);
    showToast('✏️', `Editing ${card.name}`, 'success');
}

function deleteCard(index) {
    const name = cards[index].name;
    cards.splice(index, 1);
    renderCardList();
    if (editingCardIndex === index) {
        editingCardIndex = -1;
        clearCardForm();
        document.getElementById('btn-add-card').innerHTML = '➕ Add Card';
    } else if (editingCardIndex > index) {
        editingCardIndex--;
    }
    showToast('🗑️', `${name} removed`, 'success');
}

function clearCardForm() {
    ['bc-name', 'bc-name-np', 'bc-designation', 'bc-department', 'bc-phone', 'bc-email', 'bc-address'].forEach(id => {
        document.getElementById(id).value = '';
    });
    currentPhotoData = null;

    const uploadArea = document.getElementById('photo-upload-area');
    uploadArea.innerHTML = `<span class="upload-icon" id="upload-icon-span">📷</span>
        <span class="upload-text" id="upload-text-span">Photo</span>
        <input type="file" id="bc-photo" accept="image/*" onchange="handlePhotoUpload(event)">`;

    // Reset preview
    document.getElementById('card-name-display').textContent = 'Your Name';
    document.getElementById('card-desig-display').textContent = 'Designation';
    document.getElementById('card-phone-display').textContent = '+977-98XXXXXXXX';
    document.getElementById('card-email-display').textContent = 'info@nextgeninnovations.com.np';
    document.getElementById('card-photo-area').style.display = 'none';

    editingCardIndex = -1;
    document.getElementById('btn-add-card').innerHTML = '➕ Add Card';
}

function previewCard(index) {
    const card = cards[index];
    if (!card) return;

    document.getElementById('card-name-display').textContent = card.name;
    document.getElementById('card-desig-display').textContent = card.designation || 'Designation';
    document.getElementById('card-phone-display').textContent = card.phone || '+977-98XXXXXXXX';
    document.getElementById('card-email-display').textContent = card.email || 'info@nextgeninnovations.com.np';

    const photoArea = document.getElementById('card-photo-area');
    if (card.photo) {
        photoArea.style.display = 'block';
        document.getElementById('card-photo-img').src = card.photo;
    } else {
        photoArea.style.display = 'none';
    }

    // Highlight active in list
    document.querySelectorAll('.card-list-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function renderCardList() {
    const container = document.getElementById('card-list-container');
    const emptyState = document.getElementById('empty-card-state');
    document.getElementById('card-count').textContent = `${cards.length} card${cards.length !== 1 ? 's' : ''}`;

    if (cards.length === 0) {
        container.innerHTML = '';
        container.appendChild(createEmptyState());
        return;
    }

    container.innerHTML = cards.map((card, i) => {
        const initials = card.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const avatarContent = card.photo
            ? `<img src="${card.photo}" alt="${card.name}">`
            : initials;

        return `
        <div class="card-list-item animate-slide-up" onclick="previewCard(${i})">
            <div class="item-avatar">${avatarContent}</div>
            <div class="item-info">
                <div class="item-name">${card.name}</div>
                <div class="item-desig">${card.designation || 'No designation'}</div>
            </div>
            <div class="item-actions">
                <button class="btn-icon" onclick="event.stopPropagation(); editCard(${i})" title="Edit">✏️</button>
                <button class="btn-icon" onclick="event.stopPropagation(); deleteCard(${i})" title="Delete" style="color:#dc2626;">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function createEmptyState() {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.id = 'empty-card-state';
    div.innerHTML = `
        <div class="empty-icon">💳</div>
        <p>No cards yet. Add your first card above.</p>`;
    return div;
}

// ══════════════════════════════════════
// BUSINESS CARD — PRINT
// ══════════════════════════════════════
function printCards() {
    if (cards.length === 0) {
        showToast('⚠️', 'No cards to print! Add some cards first.', 'error');
        return;
    }

    // Build print layout
    const printGrid = document.getElementById('bc-print-grid');
    printGrid.innerHTML = '';

    cards.forEach(card => {
        // Front
        const front = buildCardFrontHTML(card);
        printGrid.appendChild(front);

        // Back
        const back = buildCardBackHTML();
        printGrid.appendChild(back);
    });

    // Open print
    const lhSection = document.getElementById('letterhead-section');
    lhSection.style.display = 'none';
    printGrid.style.display = 'grid';

    window.print();

    setTimeout(() => {
        lhSection.style.display = '';
        printGrid.style.display = 'none';
    }, 500);

    showToast('🖨️', 'Print dialog opened!', 'success');
}

function buildCardFrontHTML(card) {
    const div = document.createElement('div');
    div.className = 'business-card';
    div.style.pageBreakInside = 'avoid';

    const photoHTML = card.photo
        ? `<div class="card-front-photo"><img src="${card.photo}" alt="${card.name}"></div>`
        : '';

    div.innerHTML = `
    <div class="card-front">
        <div class="card-front-top-bar"></div>
        <div class="card-front-header">
            <img src="assets/Logo.png" alt="Logo" class="card-front-logo">
            <div class="card-front-company">
                <span style="color:#0D47A1;font-weight:800;">NEXT GEN</span> INNOVATIONS<br>
                <span style="font-size:5pt;color:#4a5568;">Nepal Private Limited</span>
            </div>
        </div>
        <div class="card-front-divider"></div>
        <div class="card-front-info">
            ${photoHTML}
            <div class="card-front-details">
                <div class="card-person-name">${card.name}</div>
                <div class="card-person-desig">${card.designation || ''}</div>
                <div class="card-contact-row">
                    <span class="cc-icon">📞</span>
                    <span>${card.phone || ''}</span>
                </div>
                <div class="card-contact-row">
                    <span class="cc-icon">✉️</span>
                    <span>${card.email || 'info@nextgeninnovations.com.np'}</span>
                </div>
                <div class="card-contact-row">
                    <span class="cc-icon">🌐</span>
                    <span>nextgeninnovations.com.np</span>
                </div>
            </div>
        </div>
    </div>`;

    return div;
}

function buildCardBackHTML() {
    const div = document.createElement('div');
    div.className = 'business-card';
    div.style.pageBreakInside = 'avoid';

    div.innerHTML = `
    <div class="card-back">
        <img src="assets/Logo.png" alt="Logo" class="card-back-logo">
        <div class="card-back-name">NEXT GEN INNOVATIONS</div>
        <div class="card-back-gold-line"></div>
        <div class="card-back-info">
            नेक्स्ट जेन इनोभेसनस् नेपाल प्रा. लि.<br>
            Mahalaxmi Nagarpalika-5, Lalitpur<br>
            nextgeninnovations.com.np
        </div>
        <div class="card-back-qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nextgeninnovations.com.np" alt="QR">
        </div>
    </div>`;

    return div;
}

// ══════════════════════════════════════
// BUSINESS CARD — DOWNLOAD AS IMAGE
// ══════════════════════════════════════
async function downloadCards() {
    if (cards.length === 0) {
        showToast('⚠️', 'No cards to download! Add some cards first.', 'error');
        return;
    }

    showToast('⏳', 'Generating cards file...', 'success');

    // Convert logo to base64
    const logoBase64 = await imageToBase64('assets/Logo.png');
    const logoTag = logoBase64
        ? `<img src="${logoBase64}" width="80" height="28" alt="Logo">`
        : `<b style="color:#1E88E5;">NG</b>`;

    let cardsHTML = '';
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const photoTag = card.photo
            ? `<img src="${card.photo}" width="40" height="40" style="border:1pt solid #BBDEFB;">`
            : '';

        cardsHTML += `
        <div style="page-break-inside:avoid;margin-bottom:12mm;">
            <p style="font-size:10pt;color:#4a5568;margin-bottom:4mm;font-weight:bold;">Card ${i + 1}: ${card.name}</p>

            <!-- FRONT -->
            <table width="340" cellpadding="0" cellspacing="0" style="border:1pt solid #e2e8f0;margin-bottom:6mm;">
                <tr><td colspan="2" style="height:8pt;background:#1E88E5;"></td></tr>
                <tr>
                    <td colspan="2" style="padding:8pt 10pt 4pt;">
                        ${logoTag}
                        <span style="font-size:7pt;color:#0D47A1;font-weight:800;margin-left:4pt;">NEXT GEN</span>
                        <span style="font-size:7pt;color:#4a5568;"> INNOVATIONS</span>
                        <br><span style="font-size:5pt;color:#4a5568;">Nepal Private Limited</span>
                    </td>
                </tr>
                <tr><td colspan="2" style="border-bottom:1pt solid #BBDEFB;"></td></tr>
                <tr>
                    ${photoTag ? `<td width="50" style="padding:6pt 4pt 8pt 10pt;vertical-align:bottom;">${photoTag}</td>` : ''}
                    <td style="padding:6pt 10pt 8pt;vertical-align:bottom;" ${!photoTag ? 'colspan="2"' : ''}>
                        <p style="font-size:10pt;font-weight:bold;color:#0D47A1;margin:0 0 1pt;">${card.name}</p>
                        <p style="font-size:7pt;color:#1E88E5;margin:0 0 4pt;">${card.designation || ''}</p>
                        <p style="font-size:6pt;color:#4a5568;margin:0 0 1pt;">Tel: ${card.phone || ''}</p>
                        <p style="font-size:6pt;color:#4a5568;margin:0 0 1pt;">Email: ${card.email || 'info@nextgeninnovations.com.np'}</p>
                        <p style="font-size:6pt;color:#4a5568;margin:0;">Web: nextgeninnovations.com.np</p>
                    </td>
                </tr>
            </table>

            <!-- BACK -->
            <table width="340" cellpadding="0" cellspacing="0" style="background:#0a1628;">
                <tr><td style="padding:14pt 10pt;text-align:center;">
                    <p style="font-size:9pt;font-weight:bold;color:#ffffff;letter-spacing:1pt;margin:0 0 4pt;">NEXT GEN INNOVATIONS</p>
                    <p style="margin:0 0 4pt;"><span style="display:inline-block;width:40pt;border-top:1pt solid #D4AF37;">&nbsp;</span></p>
                    <p style="font-size:6pt;color:#999999;line-height:1.6;margin:0;">
                        नेक्स्ट जेन इनोभेसनस् नेपाल प्रा. लि.<br>
                        Mahalaxmi Nagarpalika-5, Lalitpur<br>
                        nextgeninnovations.com.np
                    </p>
                </td></tr>
            </table>
        </div>`;
    }

    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>Business Cards - Next Gen Innovations</title>
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
<![endif]-->
<style>
@page { size: A4; margin: 15mm; }
body { font-family: Calibri, Arial, sans-serif; padding: 0; margin: 0; }
table { border-collapse: collapse; }
p { margin: 0 0 2pt 0; }
</style>
</head>
<body>
<h1 style="font-size:14pt;color:#0D47A1;margin-bottom:8mm;">Business Cards — Next Gen Innovations Nepal Pvt. Ltd.</h1>
${cardsHTML}
</body>
</html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NextGen_BusinessCards.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅', `${cards.length} card(s) downloaded!`, 'success');
}

// ══════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════
let toastTimeout = null;
function showToast(icon, message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-icon').textContent = icon;
    document.getElementById('toast-message').textContent = message;
    toast.className = `toast ${type} show`;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
