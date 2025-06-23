function getNextMondayReset() {
  const now = new Date();
  const result = new Date(now);
  result.setUTCDate(now.getUTCDate() + ((1 + 7 - now.getUTCDay()) % 7 || 7));
  result.setUTCHours(15, 0, 0, 0); // 15:00 UTC = 3:00 PM UTC
  return result;
}

function updateCountdown() {
  const countdownElement = document.getElementById('countdown-timer');
  const targetTime = getNextMondayReset();

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
  try {
    const response = await fetch('data/vulture-locations.json');
    const data = await response.json();

    // Update the basic location list
    const copList = document.getElementById('cop-locations');
    if (copList) {
      copList.innerHTML = '';
      if (data.cop1) {
        const li1 = document.createElement('li');
        li1.textContent = `• ${data.cop1}`;
        copList.appendChild(li1);
      }
      if (data.cop2) {
        const li2 = document.createElement('li');
        li2.textContent = `• ${data.cop2}`;
        copList.appendChild(li2);
      }
    }

    // 🔥 Now dynamically update the cop cards
    const cardWrapper = document.querySelector('.cop-card-wrapper');
    if (cardWrapper) {
      cardWrapper.innerHTML = '';

      [data.cop1, data.cop2].forEach(cop => {
        if (!cop) return;

        const match = cop.match(/(.*?) \(Grid (\d+:\d+)\)/);
        if (!match) return;

        const name = match[1].trim().toLowerCase();
        const label = match[1].trim().toUpperCase();
        const grid = match[2].replace(':', ', ');

        const card = document.createElement('div');
        card.className = 'cop-card';
        card.innerHTML = `
          <div class="cop-title">${label}</div>
          <img src="assets/${name}.png" alt="${label} Location">
          <div class="cop-grid">${grid}</div>
        `;
        cardWrapper.appendChild(card);
      });
    }

  } catch (err) {
    console.error('Failed to load vulture-locations.json:', err);
  }
}


const copOptions = [
  { name: "Stalwart", grid: "155:160" },
  { name: "Westmore", grid: "168:161" },
  { name: "Nomad", grid: "189:157" },
  { name: "Winchester", grid: "201:148" },
  { name: "Harrison", grid: "197:125" },
  { name: "Spielberk", grid: "182:122" },
  { name: "Crusader", grid: "137:151" },
  { name: "Titan", grid: "153:121" },
  { name: "Bronco", grid: "124:135" }
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
  try {
    const res = await fetch('data/vulture-locations.json'); // remove "data/"
    const json = await res.json();
    const list = document.getElementById("live-json");
    list.innerHTML = ""; // clear old list

    if (json.cop1) {
      const li1 = document.createElement("li");
      li1.textContent = json.cop1;
      list.appendChild(li1);
    }

    if (json.cop2) {
      const li2 = document.createElement("li");
      li2.textContent = json.cop2;
      list.appendChild(li2);
    }
  } catch (error) {
    console.error("Failed to load vulture-locations.json:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  loadCopLocations();

  // Admin page logic (only runs if elements exist)
  if (document.getElementById("cop1") && document.getElementById("cop2")) {
    populateDropdown("cop1");
    populateDropdown("cop2");
    showCurrentData();

    const generateBtn = document.getElementById("generate");
    if (generateBtn) {
      generateBtn.addEventListener("click", generateJSON);
    }
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const previewBox = document.getElementById('hover-preview');
  const previewImg = previewBox.querySelector('img');

  document.querySelectorAll('.hover-image').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const imgSrc = el.getAttribute('data-img');
      previewImg.src = imgSrc;
      previewBox.style.display = 'block';
    });

    el.addEventListener('mousemove', (e) => {
      previewBox.style.left = e.pageX + 20 + 'px';
      previewBox.style.top = e.pageY + 20 + 'px';
    });

    el.addEventListener('mouseleave', () => {
      previewBox.style.display = 'none';
    });
  });
});
