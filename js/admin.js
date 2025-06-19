document.addEventListener("DOMContentLoaded", () => {
  const cop1Select = document.getElementById("cop1");
  const cop2Select = document.getElementById("cop2");
  const liveJson = document.getElementById("live-json");
  const generateBtn = document.getElementById("generate");

  const majorCoPs = [
    "STALWART (Grid 155:160)",
    "WESTMORE (Grid 168:161)",
    "NOMAD (Grid 189:157)",
    "WINCHESTER (Grid 202:148)",
    "HARRISON (Grid 197:125)",
    "SPIELBERK (Grid 182:122)",
    "TITAN (Grid 153:121)",
    "BRONCO (Grid 142:134)",
    "CRUSADER (Grid 137:151)"
  ];

  // Populate dropdowns
  majorCoPs.forEach(cop => {
    const option1 = document.createElement("option");
    option1.value = cop;
    option1.textContent = cop;
    cop1Select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cop;
    option2.textContent = cop;
    cop2Select.appendChild(option2);
  });

  // Button to generate and download JSON
  generateBtn.addEventListener("click", () => {
    const cop1 = cop1Select.value;
    const cop2 = cop2Select.value;

    const vultureData = { cop1, cop2 };

    const blob = new Blob([JSON.stringify(vultureData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vulture-locations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Show current JSON output
  function renderLiveJson() {
    liveJson.innerHTML = "";
    const li1 = document.createElement("li");
    li1.textContent = `cop1: ${cop1Select.value}`;
    const li2 = document.createElement("li");
    li2.textContent = `cop2: ${cop2Select.value}`;
    liveJson.appendChild(li1);
    liveJson.appendChild(li2);
  }

  cop1Select.addEventListener("change", renderLiveJson);
  cop2Select.addEventListener("change", renderLiveJson);
});
