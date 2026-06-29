// ===== State =====
let jobs = [];
let pricingTypes = [];
let editingId = null;

// ===== DOM refs =====
const jobsTbody      = document.getElementById('jobs-tbody');
const filterStatus   = document.getElementById('filter-status');
const filterType     = document.getElementById('filter-type');
const searchInput    = document.getElementById('search-input');
const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const jobForm        = document.getElementById('job-form');
const pricingDisplay = document.getElementById('pricing-display');
const btnAddNew      = document.getElementById('btn-add-new');
const btnCancel      = document.getElementById('btn-cancel');

// Summary els
const statTotal     = document.getElementById('stat-total');
const statScheduled = document.getElementById('stat-scheduled');
const statCompleted = document.getElementById('stat-completed');
const sumJobs       = document.getElementById('sum-jobs');
const sumRevenue    = document.getElementById('sum-revenue');
const sumUnpaid     = document.getElementById('sum-unpaid');
const sumPending    = document.getElementById('sum-pending');

// Form fields
const fCustomer  = document.getElementById('f-customer');
const fAddress   = document.getElementById('f-address');
const fDate      = document.getElementById('f-date');
const fType      = document.getElementById('f-type');
const fStatus    = document.getElementById('f-status');
const fPaid      = document.getElementById('f-paid');
const fNotes     = document.getElementById('f-notes');

// ===== Load data =====
async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Failed to load data.json');
    const data = await res.json();
    pricingTypes = data.pricingTypes;
    jobs = data.jobs;
    populatePricingOptions();
    render();
  } catch (err) {
    jobsTbody.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading data: ${err.message}</td></tr>`;
  }
}

function populatePricingOptions() {
  [filterType, fType].forEach(sel => {
    pricingTypes.forEach(pt => {
      const opt = document.createElement('option');
      opt.value = pt.id;
      opt.textContent = pt.label;
      sel.appendChild(opt);
    });
  });
}

// ===== Render =====
function render() {
  const statusVal = filterStatus.value;
  const typeVal   = filterType.value;
  const search    = searchInput.value.toLowerCase().trim();

  const filtered = jobs.filter(j => {
    const matchStatus = statusVal === 'all' || j.status === statusVal;
    const matchType   = typeVal === 'all' || j.pricingType === typeVal;
    const matchSearch = !search ||
      j.customer.toLowerCase().includes(search) ||
      j.address.toLowerCase().includes(search);
    return matchStatus && matchType && matchSearch;
  });

  renderTable(filtered);
  renderSummary(filtered);
  renderHeaderStats();
}

function renderTable(filtered) {
  if (filtered.length === 0) {
    jobsTbody.innerHTML = '<tr><td colspan="8" class="empty-state">No jobs match your filters.</td></tr>';
    return;
  }

  jobsTbody.innerHTML = filtered.map(job => {
    const pt = pricingTypes.find(p => p.id === job.pricingType);
    const price = pt ? `$${pt.base}` : '—';
    const label = pt ? pt.label : job.pricingType;
    const statusBadge = `<span class="badge badge-${job.status}">${job.status}</span>`;
    const paidLabel = job.paid
      ? '<span class="paid-yes">✓ Paid</span>'
      : '<span class="paid-no">Unpaid</span>';

    return `
      <tr>
        <td><strong>${job.customer}</strong></td>
        <td>${job.address}</td>
        <td>${job.date}</td>
        <td>${label}</td>
        <td>${price}</td>
        <td>${statusBadge}</td>
        <td>${paidLabel}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit"   onclick="openEdit(${job.id})"   aria-label="Edit ${job.customer}">Edit</button>
            <button class="btn-paid"   onclick="togglePaid(${job.id})" aria-label="Toggle paid for ${job.customer}">${job.paid ? 'Unpaid' : 'Mark Paid'}</button>
            <button class="btn-delete" onclick="deleteJob(${job.id})"  aria-label="Delete ${job.customer}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function renderSummary(filtered) {
  const total   = filtered.length;
  const revenue = filtered.reduce((sum, j) => {
    const pt = pricingTypes.find(p => p.id === j.pricingType);
    return sum + (pt ? pt.base : 0);
  }, 0);
  const unpaid  = filtered.filter(j => !j.paid).reduce((sum, j) => {
    const pt = pricingTypes.find(p => p.id === j.pricingType);
    return sum + (pt ? pt.base : 0);
  }, 0);
  const pending = filtered.filter(j => j.status === 'scheduled').length;

  sumJobs.textContent    = total;
  sumRevenue.textContent = `$${revenue}`;
  sumUnpaid.textContent  = `$${unpaid}`;
  sumPending.textContent = pending;
}

function renderHeaderStats() {
  statTotal.textContent     = jobs.length;
  statScheduled.textContent = jobs.filter(j => j.status === 'scheduled').length;
  statCompleted.textContent = jobs.filter(j => j.status === 'completed').length;
}

// ===== Modal =====
function openAdd() {
  editingId = null;
  modalTitle.textContent = 'Add New Job';
  jobForm.reset();
  updatePricingDisplay();
  modalOverlay.classList.add('open');
  fCustomer.focus();
}

function openEdit(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;
  editingId = id;
  modalTitle.textContent = 'Edit Job';
  fCustomer.value = job.customer;
  fAddress.value  = job.address;
  fDate.value     = job.date;
  fType.value     = job.pricingType;
  fStatus.value   = job.status;
  fPaid.value     = job.paid ? 'yes' : 'no';
  fNotes.value    = job.notes;
  updatePricingDisplay();
  modalOverlay.classList.add('open');
  fCustomer.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

function updatePricingDisplay() {
  const pt = pricingTypes.find(p => p.id === fType.value);
  if (pt) {
    pricingDisplay.innerHTML = `Service: ${pt.label} &nbsp;|&nbsp; Base Price: <strong>$${pt.base}</strong>`;
  } else {
    pricingDisplay.textContent = 'Select a service type to see pricing.';
  }
}

// ===== CRUD =====
jobForm.addEventListener('submit', e => {
  e.preventDefault();
  const newJob = {
    id:          editingId ?? Date.now(),
    customer:    fCustomer.value.trim(),
    address:     fAddress.value.trim(),
    date:        fDate.value,
    pricingType: fType.value,
    status:      fStatus.value,
    paid:        fPaid.value === 'yes',
    notes:       fNotes.value.trim(),
  };

  if (editingId) {
    jobs = jobs.map(j => j.id === editingId ? newJob : j);
  } else {
    jobs.push(newJob);
  }

  closeModal();
  render();
});

function deleteJob(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;
  if (!confirm(`Delete job for ${job.customer}?`)) return;
  jobs = jobs.filter(j => j.id !== id);
  render();
}

function togglePaid(id) {
  jobs = jobs.map(j => j.id === id ? { ...j, paid: !j.paid } : j);
  render();
}

// ===== Event listeners =====
btnAddNew.addEventListener('click', openAdd);
btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
filterStatus.addEventListener('change', render);
filterType.addEventListener('change', render);
searchInput.addEventListener('input', render);
fType.addEventListener('change', updatePricingDisplay);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ===== Init =====
loadData();
// async fetch complete
