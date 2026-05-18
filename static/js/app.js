/* ═══════════════════════════════
   Globals
═══════════════════════════════ */
let selectedItemObj = null;
let awesomplete;

/* ═══════════════════════════════
   Init
═══════════════════════════════ */
document.addEventListener('DOMContentLoaded', loadItems);

function loadItems() {
  showSpinner('mainSpinner');
  fetch('/api/items')
    .then(r => r.json())
    .then(items => { buildAutocomplete(items); hideSpinner('mainSpinner'); })
    .catch(() => { showToast('Failed to load items', 'danger'); hideSpinner('mainSpinner'); });
}

function buildAutocomplete(items) {
  const input = document.getElementById('item');
  const list  = items.map(item => ({ label: item.name, value: item }));

  if (awesomplete) {
    awesomplete.list = list;
    return;
  }

  awesomplete = new Awesomplete(input, {
    list,
    minChars: 1,
    autoFirst: true,
    replace(s) { this.input.value = s.label; }
  });
}

document.getElementById('item').addEventListener('awesomplete-selectcomplete', e => {
  selectedItemObj = e.text.value;
});

/* ═══════════════════════════════
   Date Helpers
═══════════════════════════════ */
function calcExpDate(amount, unit) {
  const multipliers = { days: 1, weeks: 7, months: 30, years: 365 };
  const days = Number(amount) * (multipliers[unit.toLowerCase()] || 1);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US');
}

function todayFormatted() {
  return new Date().toLocaleDateString('en-US');
}

/* ═══════════════════════════════
   Label Preview — main form
═══════════════════════════════ */
function handlePreview() {
  const initials = document.getElementById('init').value.trim().toUpperCase();

  if (!selectedItemObj) return showToast('Please select a label first', 'danger');
  if (!initials)        return showToast('Please enter your initials', 'danger');

  document.getElementById('prevName').textContent      = selectedItemObj.name;
  document.getElementById('prevUseBy').textContent     = selectedItemObj.use_by || 'Use By:';
  document.getElementById('prevExpDate').textContent   = calcExpDate(selectedItemObj.time_amt, selectedItemObj.denom);
  document.getElementById('prevPrintDate').textContent = todayFormatted();
  document.getElementById('prevInitials').textContent  = initials;

  openModal('previewModal');
}

/* ═══════════════════════════════
   Custom Label Preview
═══════════════════════════════ */
function handleCustomPreview() {
  const name     = document.getElementById('customName').value.trim();
  const expRaw   = document.getElementById('customExp').value;
  const initials = document.getElementById('customInit').value.trim().toUpperCase();

  let ok = true;
  if (!name)     { showErr('customNameErr'); document.getElementById('customName').classList.add('invalid'); ok = false; }
  if (!expRaw)   { showErr('customExpErr');  document.getElementById('customExp').classList.add('invalid');  ok = false; }
  if (!initials) { showErr('customInitErr'); document.getElementById('customInit').classList.add('invalid'); ok = false; }
  if (!ok) return;

  const [y, m, d] = expRaw.split('-').map(Number);

  document.getElementById('prevName').textContent      = name;
  document.getElementById('prevUseBy').textContent     = '';
  document.getElementById('prevExpDate').textContent   = new Date(y, m - 1, d).toLocaleDateString('en-US');
  document.getElementById('prevPrintDate').textContent = todayFormatted();
  document.getElementById('prevInitials').textContent  = initials;

  closeModal('customModal');
  openModal('previewModal');
}

/* ═══════════════════════════════
   Add Item
═══════════════════════════════ */
function addToDB() {
  const name     = document.getElementById('addName').value.trim();
  const initials = document.getElementById('addInit').value.trim().toUpperCase();

  let ok = true;
  if (!name)     { showErr('addNameErr'); document.getElementById('addName').classList.add('invalid'); ok = false; }
  if (!initials) { showErr('addInitErr'); document.getElementById('addInit').classList.add('invalid'); ok = false; }
  if (!ok) return;

  showSpinner('addSpinner');

  fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      category: document.getElementById('addCategory').value,
      use_by:   'Use By:',
      time_amt: document.getElementById('addAmt').value,
      denom:    document.getElementById('addDenom').value,
      initials
    })
  })
    .then(r => r.json())
    .then(() => {
      hideSpinner('addSpinner');
      closeModal('addModal');
      resetAddForm();
      showToast('Item added!', 'success');
      loadItems();
    })
    .catch(() => {
      hideSpinner('addSpinner');
      showToast('Failed to add item', 'danger');
    });
}

function resetAddForm() {
  ['addName', 'addInit'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('invalid');
  });
  document.getElementById('addAmt').value = '2';
  ['addNameErr', 'addInitErr'].forEach(hideErr);
}

/* ═══════════════════════════════
   Edit Item
═══════════════════════════════ */
function openEditModal() {
  if (!selectedItemObj) return showToast('Please select a label first', 'danger');

  document.getElementById('editName').value     = selectedItemObj.name;
  document.getElementById('editCategory').value = selectedItemObj.category;
  document.getElementById('editAmt').value      = selectedItemObj.time_amt;
  document.getElementById('editDenom').value    = selectedItemObj.denom;

  openModal('editModal');
}

function submitEdit() {
  const name = document.getElementById('editName').value.trim();
  const amt  = document.getElementById('editAmt').value;

  let ok = true;
  if (!name) { showErr('editNameErr'); document.getElementById('editName').classList.add('invalid'); ok = false; }
  if (!amt)  { showErr('editAmtErr');  document.getElementById('editAmt').classList.add('invalid');  ok = false; }
  if (!ok) return;

  showSpinner('editSpinner');

  fetch(`/api/items/${selectedItemObj.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      category: document.getElementById('editCategory').value,
      use_by:   'Use By:',
      time_amt: amt,
      denom:    document.getElementById('editDenom').value,
      initials: selectedItemObj.initials
    })
  })
    .then(r => r.json())
    .then(() => {
      hideSpinner('editSpinner');
      closeModal('editModal');
      showToast('Label updated!', 'success');
      loadItems();
      setTimeout(() => {
        const proper = name.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
        const match  = awesomplete._list.find(i => i.label === proper);
        if (match) {
          selectedItemObj = match.value;
          document.getElementById('item').value = match.label;
        }
      }, 400);
    })
    .catch(() => {
      hideSpinner('editSpinner');
      showToast('Failed to update label', 'danger');
    });
}

/* ═══════════════════════════════
   Modal Helpers
═══════════════════════════════ */
const openModal  = id => document.getElementById(id).classList.add('open');
const closeModal = id => document.getElementById(id).classList.remove('open');

document.querySelectorAll('.modal-backdrop-rc').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) closeModal(el.id); });
});

/* ═══════════════════════════════
   Spinner / Toast / Validation
═══════════════════════════════ */
const showSpinner = id => document.getElementById(id).classList.add('active');
const hideSpinner = id => document.getElementById(id).classList.remove('active');
const showErr     = id => document.getElementById(id).classList.add('show');
const hideErr     = id => document.getElementById(id).classList.remove('show');

document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('invalid');
    const err = document.getElementById(el.id + 'Err');
    if (err) hideErr(el.id + 'Err');
  });
});

let toastTimer;
function showToast(msg, type = 'danger', duration = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, duration);
}