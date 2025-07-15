function getNextMonday12PMUTC() {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentTime = now.getTime();

  const today12PMUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    12, 0, 0, 0
  ));

  if (currentDay === 1 && currentTime < today12PMUTC.getTime()) {
    return today12PMUTC;
  }

  const daysUntilNextMonday = (8 - currentDay) % 7 || 7;
  today12PMUTC.setUTCDate(today12PMUTC.getUTCDate() + daysUntilNextMonday);
  return today12PMUTC;
}

function updateCountdown() {
  const countdownElement = document.getElementById('countdown-timer');
  if (!countdownElement) return;

  const targetTime = getNextMonday12PMUTC();

  const interval = setInterval(() => {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();

    if (diff <= 0) {
      countdownElement.textContent = "RESET!";
      clearInterval(interval);
      loadSearchingState();
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
      18, 0, 0, 0
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
    eventEnd.setUTCHours(22, 0, 0, 0);

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

async function loadSearchingState() {
  try {
    const response = await fetch('data/searching.json');
    const data = await response.json();

    const copList = document.getElementById('cop-locations');
    if (copList) {
      copList.innerHTML = '';
      data.forEach(cop => {
        const li = document.createElement('li');
        li.textContent = `• ${cop.name} (Searching...)`;
        copList.appendChild(li);
      });
    }

    const wrapper = document.querySelector('.cop-card-wrapper');
    if (wrapper) {
      wrapper.innerHTML = '';
      data.forEach(cop => {
        const card = document.createElement('div');
        card.className = 'cop-card';
        if (cop.name.toUpperCase() === 'REDACTED') {
          card.classList.add('searching-card');
        }

        card.innerHTML = `
          <div class="cop-title">${cop.name}</div>
          <img src="${cop.icon}" alt="${cop.name} Location">
          <div class="cop-grid">${cop.grid}</div>`;
        wrapper.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Failed to load searching.json:', err);
  }
}

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

// Final logic on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCustomCountdown();
  isLiveBasedOnSchedule(false);

  const now = new Date();
  const resetTime = getNextMonday12PMUTC();

  fetch('data/vulture-locations.json')
    .then(res => res.json())
    .then(data => {
      const hasTimestamp = data.timestamp !== undefined;
      const isFresh = hasTimestamp && new Date(data.timestamp) >= resetTime;
      const hasData = data.cop1 && data.cop2;

      if (now >= resetTime && (!hasData || !isFresh)) {
        loadSearchingState(); // fallback mode after reset
      } else {
        loadCopLocations();   // show current CoP locations
      }

      // Always run the countdown for next reset
      updateCountdown();
    })
    .catch(err => {
      console.error("Failed to read vulture-locations.json:", err);
      loadSearchingState();
    });

  if (document.getElementById("cop1") && document.getElementById("cop2")) {
    populateDropdown("cop1");
    populateDropdown("cop2");
    showCurrentData();

    const generateBtn = document.getElementById("generate");
    if (generateBtn) {
      generateBtn.addEventListener("click", generateJSON);
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  document.querySelectorAll('.redacted-hover').forEach(link => {
    let target = link.querySelector('.link-text') || link;
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
        const scrambled = originalText.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iterations) return originalText[i];
          return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
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
});
