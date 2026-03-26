const VEHICLES_KEY = 'fuel_vehicles_v1';
const LOGS_KEY = 'fuel_logs_v1';

const vehicleForm = document.getElementById('vehicleForm');
const fuelForm = document.getElementById('fuelForm');
const vehicleSelect = document.getElementById('vehicleSelect');
const fuelTableBody = document.getElementById('fuelTableBody');
const statsContainer = document.getElementById('stats');
const clearAllBtn = document.getElementById('clearAll');

const formatMoney = (num) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(num);

const getVehicles = () => JSON.parse(localStorage.getItem(VEHICLES_KEY) || '[]');
const getLogs = () => JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

const saveVehicles = (data) => localStorage.setItem(VEHICLES_KEY, JSON.stringify(data));
const saveLogs = (data) => localStorage.setItem(LOGS_KEY, JSON.stringify(data));

const renderVehicleOptions = () => {
  const vehicles = getVehicles();
  vehicleSelect.innerHTML = '<option value="">اختر العربة</option>';

  vehicles.forEach((vehicle) => {
    const option = document.createElement('option');
    option.value = vehicle.id;
    option.textContent = `${vehicle.name} - ${vehicle.plate}`;
    vehicleSelect.appendChild(option);
  });
};

const buildStats = () => {
  const logs = getLogs();
  const totalLiters = logs.reduce((sum, item) => sum + Number(item.liters), 0);
  const totalCost = logs.reduce((sum, item) => sum + Number(item.totalCost), 0);
  const avgPrice = totalLiters ? totalCost / totalLiters : 0;

  statsContainer.innerHTML = `
    <div class="stat-box">
      <h3>إجمالي التفويلات</h3>
      <p>${logs.length}</p>
    </div>
    <div class="stat-box">
      <h3>إجمالي اللترات</h3>
      <p>${formatMoney(totalLiters)}</p>
    </div>
    <div class="stat-box">
      <h3>إجمالي المصروف</h3>
      <p>${formatMoney(totalCost)} جنيه</p>
    </div>
    <div class="stat-box">
      <h3>متوسط سعر اللتر</h3>
      <p>${formatMoney(avgPrice)} جنيه</p>
    </div>
  `;
};

const renderLogs = () => {
  const logs = getLogs();
  const vehicles = getVehicles();

  fuelTableBody.innerHTML = '';

  logs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((log) => {
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${log.date}</td>
        <td>${vehicle ? vehicle.name : '—'}</td>
        <td>${formatMoney(log.liters)}</td>
        <td>${formatMoney(log.pricePerLiter)}</td>
        <td>${formatMoney(log.totalCost)}</td>
        <td>${log.odometer || '—'}</td>
        <td><button class="delete-btn" data-id="${log.id}">حذف</button></td>
      `;
      fuelTableBody.appendChild(tr);
    });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const logs = getLogs().filter((item) => item.id !== id);
      saveLogs(logs);
      renderLogs();
      buildStats();
    });
  });
};

vehicleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('vehicleName').value.trim();
  const plate = document.getElementById('plateNumber').value.trim();

  const vehicles = getVehicles();
  vehicles.push({ id: crypto.randomUUID(), name, plate });
  saveVehicles(vehicles);

  vehicleForm.reset();
  renderVehicleOptions();
});

fuelForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const vehicleId = vehicleSelect.value;
  const date = document.getElementById('fuelDate').value;
  const liters = Number(document.getElementById('liters').value);
  const pricePerLiter = Number(document.getElementById('pricePerLiter').value);
  const odometer = document.getElementById('odometer').value;

  const logs = getLogs();
  logs.push({
    id: crypto.randomUUID(),
    vehicleId,
    date,
    liters,
    pricePerLiter,
    totalCost: liters * pricePerLiter,
    odometer,
  });

  saveLogs(logs);
  fuelForm.reset();
  renderLogs();
  buildStats();
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('متأكد أنك تريد مسح جميع العربات والتفويلات؟')) return;
  localStorage.removeItem(VEHICLES_KEY);
  localStorage.removeItem(LOGS_KEY);
  renderVehicleOptions();
  renderLogs();
  buildStats();
});

renderVehicleOptions();
renderLogs();
buildStats();
