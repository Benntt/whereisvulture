function updateCountdown() {
  const countdownElement = document.getElementById('countdown-timer');
  if (!countdownElement) return;

  function getNextMonday5AMUTC() {
    const now = new Date();
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ));

    const currentDay = nowUTC.getUTCDay();
    const target = new Date(nowUTC);
    target.setUTCHours(10, 0, 0, 0); // 5AM EST = 10AM UTC

    const diff = (1 + 7 - currentDay) % 7 || 7;
    if (currentDay === 1 && nowUTC < target) return target;

    target.setUTCDate(target.getUTCDate() + diff);
    return target;
  }

  const targetTime = getNextMonday5AMUTC();
  const interval = setInterval(() => {
    const nowUTC = new Date();
    const diff = targetTime.getTime() - nowUTC.getTime();

    if (diff <= 0) {
      countdownElement.textContent = "RESET!";
      clearInterval(interval);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

function updateCustomCountdown() {
  const el = document.getElementById('custom-countdown-timer');
  if (!el) return;

  function getNextFriday2PMUTC() {
    const now = new Date();
    const target = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      18, 0, 0, 0 // 2PM EST = 18:00 UTC
    ));

    const day = now.getUTCDay();
    const hour = now.getUTCHours();

    if (day > 5 || (day === 5 && hour >= 22)) {
      target.setUTCDate(target.getUTCDate() + ((12 - day) % 7));
    } else if (day < 5) {
      target.setUTCDate(target.getUTCDate() + (5 - day));
    }

    return target;
  }

  function updateTimer() {
    const now = new Date();
    const eventStart = getNextFriday2PMUTC();
    const eventEnd = new Date(eventStart);
    eventEnd.setUTCHours(22, 0, 0, 0); // 6PM EST = 22:00 UTC

    if (now >= eventStart && now < eventEnd) {
      el.textContent = "LIVE";
      return;
    }

    const diff = eventStart.getTime() - now.getTime();
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;

    el.textContent = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

async function loadCopLocations() {
  try {
    const response = await fetch('data/vulture-locations.json');
    const data = await response.json();

    // Calculate the most recent Monday at 10:00 UTC (5AM EST)
    function getLastResetTime() {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const lastMonday = new Date(now);
      lastMonday.setUTCDate(now.getUTCDate() - daysSinceMonday);
      lastMonday.setUTCHours(10, 0, 0, 0);

      // If we haven't hit 10:00 UTC yet this Monday, go back to last week
      if (now < lastMonday) {
        lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
      }
      return lastMonday;
    }

    const lastReset = getLastResetTime();
    const lastUpdated = new Date(data.timestamp);
    const isStale = lastUpdated < lastReset;

    const wrapper = document.querySelector('.cop-card-wrapper');
    const copList = document.getElementById('cop-locations');

    if (isStale) {
      const searchRes = await fetch('data/searching.json');
      const searchData = await searchRes.json();
      const s = searchData[0];

      if (wrapper) {
        wrapper.innerHTML = `
          <div class="cop-card searching">
            <div class="cop-title">${s.name}</div>
            <img src="${s.icon}" alt="Searching for Vulture">
            <div class="cop-grid">${s.grid}</div>
          </div>`;
      }
      if (copList) {
        copList.innerHTML = `<li>• ${s.status}</li>`;
      }
      return;
    }

    // Data is fresh -- show locations normally
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

    if (wrapper) {
      wrapper.innerHTML = '';
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
          <div class="cop-grid">${grid}</div>`;
        wrapper.appendChild(card);
      });
    }

  } catch (err) {
    console.error('Failed to load vulture-locations.json:', err);
  }
}

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
  try {
    const res = await fetch('data/vulture-locations.json');
    const json = await res.json();
    const list = document.getElementById("live-json");
    list.innerHTML = "";

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
  updateCustomCountdown();
  loadCopLocations();

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
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // --- NAV LINK DECODE ---
  document.querySelectorAll('.redacted-hover').forEach(link => {
    const target = link.querySelector('.link-text') || link;
    let originalText = target.getAttribute('data-original');

    if (!originalText) {
      originalText = target.textContent.trim();
      target.setAttribute('data-original', originalText);
    }

    let decoding = false;

    link.addEventListener('mouseenter', () => {
      if (decoding) return;
      decoding = true;

      let iterations = 0;
      const interval = setInterval(() => {
        const scrambled = originalText
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iterations) return originalText[i];
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");

        target.textContent = scrambled;
        iterations += 1 / 3;

        if (iterations >= originalText.length) {
          clearInterval(interval);
          target.textContent = originalText;
          decoding = false;
        }
      }, 30);
    });
  });

  // --- STREAM LIVE DOT ---
  function isLiveBasedOnSchedule(debug = false) {
    let isLive = true;

    if (!debug) {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const easternOffset = -4;
      const eastern = new Date(utc + 3600000 * easternOffset);
      const day = eastern.getDay();
      const hour = eastern.getHours();

      if (day >= 1 && day <= 4) {
        isLive = hour >= 7 && hour < 10;
      } else if (day === 5) {
        isLive = hour >= 7 && hour < 18;
      } else {
        isLive = false;
      }
    }

    const dot = document.getElementById("live-indicator");
    const streamLabel = document.querySelector('.stream-label');
    if (dot && streamLabel) {
      dot.style.display = isLive ? "inline-block" : "none";
      streamLabel.classList.toggle("live-glow", isLive);
    }
  }

  isLiveBasedOnSchedule(false);
});
