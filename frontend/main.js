import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// init map
const map = L.map("map").setView([-0.95, 100.35], 13);
const evacuationPointLayer = L.layerGroup().addTo(map);

// Icon setting
const evacuationPointIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  popupAnchor: [0, -28],
  shadowSize: [30, 30],
});

const scenarioMarkerUrl = new URL(
  "./icon/icons8-marker-40.png",
  import.meta.url,
).href;

const scenarioEventIcon = L.icon({
  iconUrl: scenarioMarkerUrl,
  iconRetinaUrl: scenarioMarkerUrl,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 30],
  shadowSize: [0, 0],
});

// basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

const sidebarButtons = document.querySelectorAll(".sidebar .btn");
const dataContainer = document.getElementById("data");
const sectionAction = document.getElementById("section-action");

const views = {
  simulation: {
    action: `
      <div id="action-simulation">
        <div class="btn data-item" id="import-evacuees">
          <span>Import Evacuees</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M12 4L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12 20C7.58172 20 4 16.4183 4 12M20 12C20 14.5264 18.8289 16.7792 17 18.2454" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
            </g>
          </svg>
        </div>

        <div class="btn data-item" id="start-simulation">
          <span>Start Simulation</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M5 3L19 12L5 21V3Z" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
          </svg>
        </div>
      </div>
    `,
  },

  scenario: {
    action: `
      <div id="action-simulation">
        <div class="btn data-item" id="change-scenario">
          <span>Change Scenario</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M12 4L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12 20C7.58172 20 4 16.4183 4 12M20 12C20 14.5264 18.8289 16.7792 17 18.2454" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
            </g>
          </svg>
        </div>
      </div>
    `,
  },

  evacuation: {
    action: `
      <div id="action-simulation">
        <div class="btn data-item" id="change-evacuation-points">
          <span>Change Evacuation Points</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M12 4L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12 20C7.58172 20 4 16.4183 4 12M20 12C20 14.5264 18.8289 16.7792 17 18.2454" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
            </g>
          </svg>
        </div>
      </div>
    `,
  },
};

const panelUrls = {
  scenario: "http://localhost:5000/scenario",
  evacuation: "http://localhost:5000/evacuation-points",
};

function createEmptySimulationRow() {
  return {
    lat: "",
    long: "",
    speed: "",
  };
}

function getPanelFromPath(pathname = window.location.pathname) {
  const route = pathname.replace(/^\/+|\/+$/g, "");

  if (!route || route === "index.html") {
    return "simulation";
  }

  if (route === "evacuation-points") {
    return "evacuation";
  }

  if (Object.prototype.hasOwnProperty.call(views, route)) {
    return route;
  }

  return "simulation";
}

function syncPanelUrl(panel, replaceState = false) {
  const nextPath = `/${panel}`;

  if (replaceState) {
    window.history.replaceState({ panel }, "", nextPath);
    return;
  }

  if (window.location.pathname !== nextPath) {
    window.history.pushState({ panel }, "", nextPath);
  }
}

let simulationRows = [createEmptySimulationRow()];
let simulationData = [];

function renderSimulationRows() {
  return simulationRows
    .map((row, index) => renderSimulationRow(row, index))
    .join("");
}

function setSimulationRows(rows) {
  if (Array.isArray(rows) && rows.length > 0) {
    simulationRows = rows.map((row) => ({
      lat: row.lat ?? "",
      long: row.long ?? "",
      speed: row.speed ?? "",
    }));
  } else {
    simulationRows = [createEmptySimulationRow()];
  }

  simulationData = [];
  sectionAction.innerHTML = renderSimulationAction();
  dataContainer.innerHTML = renderPanelData("simulation");
}

function buildSimulationPayload() {
  return simulationRows
    .map((row) => ({
      lat: Number(row.lat),
      long: Number(row.long),
      speed: Number(row.speed),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.lat) ||
        Number.isFinite(row.long) ||
        Number.isFinite(row.speed),
    );
}

const addOverlay = document.createElement("div");
addOverlay.id = "add-overlay";
addOverlay.className = "overlay hidden";
addOverlay.innerHTML = `
  <div class="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
    <h3 id="overlay-title"></h3>
    <div id="overlay-body"></div>
    <div class="overlay-actions">
      <button type="button" id="overlay-cancel">Batal</button>
      <button type="button" id="overlay-save">Simpan</button>
    </div>
  </div>
`;
document.body.appendChild(addOverlay);

const overlayTitle = addOverlay.querySelector("#overlay-title");
const overlayBody = addOverlay.querySelector("#overlay-body");
const overlayCancel = addOverlay.querySelector("#overlay-cancel");
const overlaySave = addOverlay.querySelector("#overlay-save");

let overlayMode = "";

function renderOverlayForm(mode) {
  if (mode === "evacuee") {
    overlayTitle.textContent = "Tambah Evacuee";
    overlayBody.innerHTML = `
      <div class="field-row">
        <span class="field-label">Lat:</span>
        <input class="inline-input" id="overlay-lat" type="number" step="0.0001" value="0.0000" />
      </div>
      <div class="field-row">
        <span class="field-label">Long:</span>
        <input class="inline-input" id="overlay-long" type="number" step="0.0001" value="0.0000" />
      </div>
      <div class="field-row">
        <span class="field-label">Speed:</span>
        <input class="inline-input" id="overlay-speed" type="number" step="0.0001" value="0.0000" />
      </div>
    `;
    return;
  }

  overlayTitle.textContent = "Tambah Evacuation Point";
  overlayBody.innerHTML = `
    <div class="field-row">
      <span class="field-label">Lat:</span>
      <input class="inline-input" id="overlay-lat" type="number" step="0.0001" value="0.0000" />
    </div>
    <div class="field-row">
      <span class="field-label">Long:</span>
      <input class="inline-input" id="overlay-long" type="number" step="0.0001" value="0.0000" />
    </div>
  `;
}

function openOverlay(mode) {
  overlayMode = mode;
  renderOverlayForm(mode);
  addOverlay.classList.remove("hidden");
}

function closeOverlay() {
  addOverlay.classList.add("hidden");
  overlayMode = "";
}

overlayCancel.addEventListener("click", closeOverlay);

addOverlay.addEventListener("click", (event) => {
  if (event.target === addOverlay) {
    closeOverlay();
  }
});

overlaySave.addEventListener("click", () => {
  if (overlayMode === "evacuee") {
    const lat = Number(document.getElementById("overlay-lat")?.value);
    const long = Number(document.getElementById("overlay-long")?.value);
    const speed = Number(document.getElementById("overlay-speed")?.value);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(long) ||
      !Number.isFinite(speed)
    ) {
      alert("Input evacuee harus angka valid");
      return;
    }

    simulationData.push({ lat, long, speed });
    closeOverlay();
    updateMainContent("simulation");
    return;
  }

  closeOverlay();
});

function renderSimulationRow(row, index) {
  return `
    <div class="data-item simulation-row card" data-row-index="${index}">
      <div class="information">
        <div class="card-header">
          <span class="label">Evacuee ${index + 1}</span>
          <button class="simulation-delete-row" type="button" data-row-index="${index}">
            Delete
          </button>
        </div>

        <div class="simulation-row-fields">
          <label class="field-row">
            <span class="field-label">Lat</span>
            <input
              class="inline-input simulation-input"
              data-field="lat"
              data-row-index="${index}"
              type="number"
              step="any"
              placeholder="0.0000"
              value="${row.lat}"
            />
          </label>

          <label class="field-row">
            <span class="field-label">Long</span>
            <input
              class="inline-input simulation-input"
              data-field="long"
              data-row-index="${index}"
              type="number"
              step="any"
              placeholder="0.0000"
              value="${row.long}"
            />
          </label>

          <label class="field-row">
            <span class="field-label">Speed</span>
            <input
              class="inline-input simulation-input"
              data-field="speed"
              data-row-index="${index}"
              type="number"
              step="any"
              placeholder="0.0000"
              value="${row.speed}"
            />
          </label>
        </div>
      </div>
    </div>
  `;
}

function resetSimulationRows(count = 1) {
  simulationRows = [];

  for (let index = 0; index < count; index += 1) {
    simulationRows.push(createEmptySimulationRow());
  }

  if (simulationRows.length === 0) {
    simulationRows.push(createEmptySimulationRow());
  }

  simulationData = [];
}

function renderSimulationAction() {
  return `
    <div id="action-simulation">
      <div class="btn data-item" id="import-evacuees">
        <span>Import Evacuees</span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M12 4L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 20C7.58172 20 4 16.4183 4 12M20 12C20 14.5264 18.8289 16.7792 17 18.2454" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
          </g>
        </svg>
      </div>

      <div class="simulation-form">
        ${renderSimulationRows()}

        <button class="simulation-add-row" id="add-simulation-row" type="button">
          Tambah evacuee
        </button>
      </div>

      <div class="btn data-item" id="start-simulation">
        <span>Start Simulation</span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M5 3L19 12L5 21V3Z" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>
      </div>
    </div>
  `;
}

function renderPanelData(panel, data) {
  if (panel === "scenario") {
    const scenario = Array.isArray(data) ? data : [data];
    if (scenario.length === 0) {
      return `<div class="data-item empty-state">Tidak ada scenario</div>`;
    }

    L.marker(
      [
        Number(scenario[0].x ?? scenario[0].lat),
        Number(scenario[0].y ?? scenario[0].long),
      ],
      { icon: scenarioEventIcon },
    )
      .bindPopup(
        `<strong>Scenario Point</strong><br />
        Magnitude: ${scenario[0].magnitude ?? "0.0000"}<br />
        Lat: ${scenario[0].x ?? scenario[0].lat ?? "0.0000"}, Long: ${scenario[0].y ?? scenario[0].long ?? "0.0000"}`,
      )
      .addTo(map);

    map.setView(
      [
        Number(scenario[0].x ?? scenario[0].lat),
        Number(scenario[0].y ?? scenario[0].long),
      ],
      13,
    );

    return scenario
      .map(
        (item, index) => `
          <div class="data-item scenario">
            <div class="information">
              <div class="card-header">
                <span class="label">Scenario ${index + 1}</span>
              </div>
              <div class="value scenario-meta">
                <div class="meta-row">
                  <span class="meta-label">Magnitude</span>
                  <span class="meta-value">${item.magnitude ?? "0.0000"}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Latitude</span>
                  <span class="meta-value">${item.x ?? "0.0000"}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Longitude</span>
                  <span class="meta-value">${item.y ?? "0.0000"}</span>
                </div>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  }

  if (panel === "evacuation") {
    const points = Array.isArray(data) ? data : [];
    evacuationPointLayer.clearLayers();

    if (points.length === 0) {
      return `<div class="data-item empty-state">Tidak ada evacuation point</div>`;
    }

    points.forEach((item, index) => {
      const lat = Number(item.y ?? item.lat);
      const lng = Number(item.x ?? item.long);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      L.marker([lat, lng], { icon: evacuationPointIcon })
        .bindPopup(
          `<strong>Evacuation Point ${index + 1}</strong><br />
          ${item.nama_tempat ?? item.name ?? "Evacuation Point"}<br />
          Lat: ${lat}, Long: ${lng}`,
        )
        .addTo(evacuationPointLayer);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points
          .map((item) => [
            Number(item.y ?? item.lat),
            Number(item.x ?? item.long),
          ])
          .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)),
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    return points
      .map(
        (item, index) => `
          <div class="data-item evacuation-points card">
            <div class="information">
              <div class="card-header">
                <span class="label">Evacuation Point ${index + 1}</span>
                <span class="badge">${item.status_tempat ?? "Aktif"}</span>
              </div>

              <div class="value evacuation-meta">
                <div class="meta-row">
                  <span class="meta-label">Name</span>
                  <span class="meta-value">${item.nama_tempat ?? item.name ?? "Evacuation Point"}</span>
                </div>
                <div class="meta-grid">
                  <div class="meta-row">
                    <span class="meta-label">Lat</span>
                    <span class="meta-value">${item.y ?? item.lat ?? "0.0000"}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">Long</span>
                    <span class="meta-value">${item.x ?? item.long ?? "0.0000"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  }

  return "";
}

function getPanelUrl(panel) {
  return panelUrls[panel] ?? "";
}

async function updateMainContent(panel) {
  sectionAction.innerHTML =
    panel === "simulation" ? renderSimulationAction() : views[panel].action;
  dataContainer.innerHTML = `<div class="data-item">Loading...</div>`;

  if (panel === "simulation") {
    dataContainer.innerHTML = renderPanelData(panel);
    return;
  }

  const url = getPanelUrl(panel);
  if (!url) return;

  try {
    const response = await window.fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    dataContainer.innerHTML = renderPanelData(panel, data);
  } catch (error) {
    console.error("Error fetching data:", error);
    dataContainer.innerHTML = `<div class="data-item">Gagal memuat data</div>`;
  }
}

function setActiveSidebar(panel, { updateHistory = true } = {}) {
  const nextPanel = getPanelFromPath(`/${panel}`);

  sidebarButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === nextPanel);
  });

  if (updateHistory) {
    syncPanelUrl(nextPanel);
  }

  updateMainContent(nextPanel);
}

sidebarButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveSidebar(btn.dataset.panel);
  });
});

sectionAction.addEventListener("input", (event) => {
  const input = event.target.closest(".simulation-input");
  if (!input) return;

  const rowIndex = Number(input.dataset.rowIndex);
  const field = input.dataset.field;
  if (!Number.isInteger(rowIndex) || !field || !simulationRows[rowIndex]) {
    return;
  }

  simulationRows[rowIndex] = {
    ...simulationRows[rowIndex],
    [field]: input.value,
  };
});

sectionAction.addEventListener("click", async (event) => {
  const addRowButton = event.target.closest("#add-simulation-row");
  if (addRowButton) {
    simulationRows = [...simulationRows, createEmptySimulationRow()];
    sectionAction.innerHTML = renderSimulationAction();
    return;
  }

  const deleteRowButton = event.target.closest(".simulation-delete-row");
  if (deleteRowButton) {
    const rowIndex = Number(deleteRowButton.dataset.rowIndex);

    if (Number.isInteger(rowIndex) && simulationRows[rowIndex]) {
      simulationRows = simulationRows.filter((_, index) => index !== rowIndex);

      if (simulationRows.length === 0) {
        simulationRows = [createEmptySimulationRow()];
      }

      sectionAction.innerHTML = renderSimulationAction();
    }

    return;
  }

  const startButton = event.target.closest("#start-simulation");
  if (!startButton) return;

  const payload = buildSimulationPayload();

  if (payload.length === 0) {
    alert("Tambahkan minimal satu evacuee terlebih dahulu");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/simulation-evacuees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    simulationData = payload;
    console.log("response", await response.json());
  } catch (error) {
    console.error("Error running simulation:", error);
  }
});

window.addEventListener("popstate", () => {
  setActiveSidebar(getPanelFromPath(), { updateHistory: false });
});

document.addEventListener("click", (event) => {
  const importButton = event.target.closest(
    "#import-evacuees, #change-scenario, #change-evacuation-points",
  );

  if (!importButton) return;
});

globalThis.addEventListener("simulation-csv-imported", (event) => {
  const importedRows = Array.isArray(event.detail?.rows)
    ? event.detail.rows
    : [];
  setSimulationRows(importedRows);
});

setActiveSidebar(getPanelFromPath(), { updateHistory: false });
if (window.location.pathname !== `/${getPanelFromPath()}`) {
  syncPanelUrl(getPanelFromPath(), true);
}
