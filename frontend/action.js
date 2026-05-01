// Frontend action handling: file uploads
const csvInput = document.createElement("input");
csvInput.type = "file";
csvInput.accept = ".csv,text/csv";
csvInput.hidden = true;
document.body.appendChild(csvInput);

let uploadMode = "";

function normalizeHeader(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "");
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function parseEvacueeCsv(text) {
  const normalizedText = `${text.startsWith("\uFEFF") ? text.slice(1) : text}`
    .replaceAll("\r", "")
    .trim();
  if (!normalizedText) {
    return [];
  }

  const lines = normalizedText
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const latIndex = headers.findIndex((header) =>
    ["lat", "latitude", "lang", "lintang"].includes(header),
  );
  const longIndex = headers.findIndex((header) =>
    ["long", "lng", "lon", "longitude", "lot", "bujur"].includes(header),
  );
  const speedIndex = headers.findIndex((header) =>
    [
      "speed",
      "kecepatanjalan",
      "kecepatan",
      "walkingpeed",
      "walkingspeed",
    ].includes(header),
  );

  return lines.slice(1).reduce((rows, line) => {
    const columns = splitCsvLine(line);
    const lat = columns[latIndex] ?? "";
    const long = columns[longIndex] ?? "";
    const speed = columns[speedIndex] ?? "";

    if (lat === "" && long === "" && speed === "") {
      return rows;
    }

    rows.push({ lat, long, speed });
    return rows;
  }, []);
}

document.addEventListener("click", (event) => {
  const importButton = event.target.closest(
    "#import-evacuees, #change-scenario, #change-evacuation-points",
  );
  if (importButton) {
    uploadMode = importButton.id;
    csvInput.click();
  }
});

csvInput.addEventListener("change", async () => {
  const file = csvInput.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("File harus CSV");
    csvInput.value = "";
    return;
  }

  if (uploadMode === "import-evacuees") {
    try {
      const text = await file.text();
      const rows = parseEvacueeCsv(text);

      if (rows.length === 0) {
        alert("CSV evacuee kosong atau kolomnya tidak sesuai");
        return;
      }

      globalThis.dispatchEvent(
        new CustomEvent("simulation-csv-imported", {
          detail: { rows },
        }),
      );
    } catch (error) {
      console.error(error);
      alert("Gagal membaca CSV evacuee");
    } finally {
      csvInput.value = "";
      uploadMode = "";
    }

    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", uploadMode);

  try {
    const response = await fetch("http://localhost:5000/upload-csv", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload gagal");
    }

    alert("CSV berhasil dikirim ke backend");
  } catch (error) {
    console.error(error);
    alert("Gagal upload CSV");
  } finally {
    csvInput.value = "";
    uploadMode = "";
  }
});
