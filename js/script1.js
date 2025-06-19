function getNextMonday5AM() {
  const now = new Date();
  const result = new Date(now);
  result.setUTCDate(now.getUTCDate() + ((1 + 7 - now.getUTCDay()) % 7 || 7));
  result.setUTCHours(9, 0, 0, 0);
  return result;
}

function updateCountdown() {
  const countdownElement = document.getElementById('countdown-timer');
  const targetTime = getNextMonday5AM();

  const interval = setInterval(() => {
    const now = new Date();
    const diff = targetTime - now;

    if (diff <= 0) {
      countdownElement.textContent = "RESET!";
      clearInterval(interval);
      return;
    }

    const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

    countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
  }, 1000);
}

async function loadCopLocations() {
  const response = await fetch('data/vulture-locations.json');
  const data = await response.json();

  const copList = document.getElementById('cop-locations');
  if (!copList) return;

  data.locations.forEach(loc => {
    const li = document.createElement('li');
    li.textContent = `${loc.name} (Grid ${loc.grid})`;
    copList.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  loadCopLocations();
});
const copOptions = [
  { name: "Crusader", grid: "137:151" },
  { name: "Nomad", grid: "189:157" },
  { name: "Fort Narith", grid: "145:162" },
  { name: "Pha Lang Airfield", grid: "181:139" },
  { name: "Tiger Bay", grid: "123:166" },
  { name: "YBL-1", grid: "176:176" },
  { name: "YBL-2", grid: "173:152" }
];

function populateDropdown(id) {
  const select = document.getElementById(id);
  copOptions.forEach(cop => {
    const opt = document.createElement('option');
    opt.value = cop.name;
    opt.textContent = `${cop.name} (${cop.grid})`;
    select.appendChild(opt);
  });
}

function generateJSON() {
  const cop1 = document.getElementById("cop1").value;
  const cop2 = document.getElementById("cop2").value;

  const selected = copOptions.filter(c => c.name === cop1 || c.name === cop2);

  const json = JSON.stringify({ locations: selected }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "vulture-locations.json";
  link.click();
}

async function showCurrentData() {
  const res = await fetch("data/vulture-locations.json");
  const json = await res.json();
  const list = document.getElementById("live-json");
  json.locations.forEach(loc => {
    const li = document.createElement("li");
    li.textContent = `${loc.name} (Grid ${loc.grid})`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateDropdown("cop1");
  populateDropdown("cop2");
  showCurrentData();

  document.getElementById("generate").addEventListener("click", generateJSON);
});
s