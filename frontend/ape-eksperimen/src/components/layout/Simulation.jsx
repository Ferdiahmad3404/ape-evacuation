import { Button, Flex, Paper, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Simulation.css";

const createRowId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createDeparturePoint = (index) => ({
  id: createRowId(),
  lat: "",
  lng: "",
});

const normalizeCoordinate = (value) => {
  const numericValue = Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return String(numericValue);
};

const detectDelimiter = (line) => {
  if (line.includes("\t")) {
    return "\t";
  }

  if (line.includes(";")) {
    return ";";
  }

  return ",";
};

const parseCoordinateCsv = (content) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const delimiter = detectDelimiter(lines[0]);
  const headerCells = lines[0].split(delimiter).map((cell) => cell.trim());
  const headerLookup = headerCells.map((cell) => cell.toLowerCase());
  const hasHeader = headerLookup.some((cell) =>
    /lat|latitude|lng|lon|long|longitude/.test(cell),
  );
  const latitudeIndex = headerLookup.findIndex((cell) =>
    /^(lat|latitude)$/.test(cell),
  );
  const longitudeIndex = headerLookup.findIndex((cell) =>
    /^(lng|lon|long|longitude)$/.test(cell),
  );
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const cells = line.split(delimiter).map((cell) => cell.trim());
      let latitude = null;
      let longitude = null;

      if (hasHeader && latitudeIndex >= 0 && longitudeIndex >= 0) {
        latitude = Number.parseFloat(cells[latitudeIndex]);
        longitude = Number.parseFloat(cells[longitudeIndex]);
      } else {
        const numericCells = cells
          .map((cell) => Number.parseFloat(cell))
          .filter((value) => Number.isFinite(value));

        [latitude, longitude] = numericCells;
      }

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        lat: String(latitude),
        lng: String(longitude),
      };
    })
    .filter(Boolean);
};

function Simulation({
  mapSelection,
  mapPickTargetId,
  onRequestMapPick = () => {},
}) {
  const csvInputRef = useRef(null);
  const [departurePoints, setDeparturePoints] = useState([
    createDeparturePoint(1),
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapSelection) {
      return;
    }

    setDeparturePoints((currentPoints) =>
      currentPoints.map((point) =>
        point.id === mapSelection.rowId
          ? {
              ...point,
              lat: normalizeCoordinate(mapSelection.latitude),
              lng: normalizeCoordinate(mapSelection.longitude),
            }
          : point,
      ),
    );
  }, [mapSelection]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = departurePoints.map((point) => ({
      latitude: Number(point.lat),
      longitude: Number(point.lng),
    }));

    try {
      const response = await fetch("http://localhost:5000/api/simulations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert(data.message || "Simulation gagal");
        return;
      }

      console.log("Simulation result:", data);
      alert("Simulation berhasil");

      navigate(`/result/${data.scenario_id}`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi");
    }
  };

  const handleAddPoint = () => {
    setDeparturePoints((currentPoints) => [
      ...currentPoints,
      createDeparturePoint(currentPoints.length + 1),
    ]);
  };

  const handleRemovePoint = (pointId) => {
    setDeparturePoints((currentPoints) => {
      if (currentPoints.length === 1) {
        return currentPoints;
      }

      const nextPoints = currentPoints.filter((point) => point.id !== pointId);

      return nextPoints.length > 0 ? nextPoints : currentPoints;
    });

    if (mapPickTargetId === pointId) {
      onRequestMapPick(null);
    }
  };

  const handleCoordinateChange = (pointId, field, value) => {
    setDeparturePoints((currentPoints) =>
      currentPoints.map((point) =>
        point.id === pointId ? { ...point, [field]: value } : point,
      ),
    );
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileContent = await file.text();
    const parsedPoints = parseCoordinateCsv(fileContent);

    setDeparturePoints(
      parsedPoints.length > 0
        ? parsedPoints.map((point, index) => ({
            id: createRowId(),
            lat: point.lat,
            lng: point.lng,
          }))
        : [createDeparturePoint(1)],
    );

    if (mapPickTargetId !== null) {
      onRequestMapPick(null);
    }

    event.target.value = "";
  };

  const handleOpenCsvPicker = () => {
    csvInputRef.current?.click();
  };

  const handleRequestMapPick = (rowId) => {
    onRequestMapPick(rowId);
  };

  const isMapPickTarget = (pointId) => mapPickTargetId === pointId;

  return (
    <Paper className="simulation border" shadow="md" radius="lg" withBorder>
      <Flex
        component="form"
        onSubmit={handleSubmit}
        direction="column"
        justify="space-between"
        h="100%"
        p="xs"
        gap="sm"
      >
        <Flex direction="column" gap="xs">
          <Text fw={700} size="lg">
            Titik Keberangkatan
          </Text>
        </Flex>

        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          onChange={handleCsvUpload}
          style={{ display: "none" }}
        />

        <Flex justify="space-between" align="center" gap="sm" wrap="wrap">
          <Button
            type="button"
            radius="sm"
            color="gray"
            onClick={handleOpenCsvPicker}
          >
            Upload CSV
          </Button>
          <Button
            type="button"
            radius="sm"
            color="blue"
            onClick={handleAddPoint}
          >
            Tambahkan Titik Keberangkatan
          </Button>
        </Flex>

        <Flex className="simulation-list" direction="column" gap="sm">
          {departurePoints.map((point, index) => {
            const activeMapPick = isMapPickTarget(point.id);
            const pointNumber = index + 1;

            return (
              <Flex
                key={point.id}
                className="simulation-row border"
                direction="column"
                gap="xs"
                p="sm"
                bg="#D9D9D9"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  gap="xs"
                  wrap="wrap"
                >
                  <Text fw={700}>Titik Keberangkatan {pointNumber}</Text>
                  <Button
                    type="button"
                    size="xs"
                    variant={activeMapPick ? "filled" : "light"}
                    color={activeMapPick ? "green" : "dark"}
                    onClick={() =>
                      handleRequestMapPick(activeMapPick ? null : point.id)
                    }
                  >
                    {activeMapPick
                      ? "Klik peta untuk isi koordinat"
                      : "Pilih dari peta"}
                  </Button>
                </Flex>

                <Flex gap="sm" wrap="wrap" align="flex-end" c="dark">
                  <label className="simulation-field">
                    <span>Latitude</span>
                    <input
                      type="text"
                      step="any"
                      inputMode="decimal"
                      value={point.lat}
                      onChange={(event) =>
                        handleCoordinateChange(
                          point.id,
                          "lat",
                          event.target.value,
                        )
                      }
                      style={{
                        color: "#111",
                        backgroundColor: "#fff",
                      }}
                    />
                  </label>

                  <label className="simulation-field">
                    <span>Longitude</span>
                    <input
                      type="text"
                      step="any"
                      inputMode="decimal"
                      value={point.lng}
                      onChange={(event) =>
                        handleCoordinateChange(
                          point.id,
                          "lng",
                          event.target.value,
                        )
                      }
                      style={{
                        color: "#111",
                        backgroundColor: "#fff",
                      }}
                    />
                  </label>

                  <Button
                    type="button"
                    size="sm"
                    color="red"
                    variant="light"
                    disabled={departurePoints.length === 1}
                    onClick={() => handleRemovePoint(point.id)}
                  >
                    Hapus
                  </Button>
                </Flex>
              </Flex>
            );
          })}
        </Flex>

        <Flex direction="column" gap="xs">
          <Button
            className="border"
            type="submit"
            radius="0px"
            color="gray"
            onClick={() =>
              console.log("Simulate with departure points:", departurePoints)
            }
            radius="sm"
          >
            Simulate
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}

export default Simulation;
