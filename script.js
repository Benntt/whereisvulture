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

// OPTIONAL: Add a little separation logic
async function loadCopLocations() {
  try {
    const response = await fetch('data/vulture-locations.json');
    const data = await response.json();

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

    const wrapper = document.querySelector('.cop-card-wrapper');
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