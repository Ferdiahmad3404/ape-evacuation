import { Button, Flex, Paper, Select, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import "./Departure.css";

function Departure({ onShowRoutes, onMapFocus }) {
  const navigate = useNavigate();

  const { scenario_id, departure_point_id } = useParams();

  const [selectedRow, setSelectedRow] = useState(null);

  const speedWalk = [
    { id: 1, name: "Lambat", value: 0.8 },
    { id: 2, name: "Sedang", value: 1.0 },
    { id: 3, name: "Cepat", value: 1.2 },
  ];

  const [selectedCell, setSelectedCell] = useState({
    rowId: null,
    type: null,
  });

  const [selectedSpeedWalk, setSelectedSpeedWalk] = useState(
    speedWalk[1].value.toString(),
  );

  const evacuationPoints = [
    {
      id: 1,
      name: "Titik Evakuasi 1",

      ETE_dijkstra: 30,
      status_dijkstra: "Active",

      // Monas -> Menteng -> Tebet -> Kampung Melayu
      geometry: [
        [-6.1754, 106.8272], // Monas
        [-6.1865, 106.8326], // Menteng
        [-6.2052, 106.8451], // Manggarai
        [-6.225, 106.852], // Tebet
        [-6.2395, 106.866], // Kampung Melayu
      ],

      ETE_dijkstra_rst: 25,
      status_dijkstra_rst: "Active",

      // alternatif lebih timur
      geometry_rst: [
        [-6.1754, 106.8272], // Monas
        [-6.188, 106.842],
        [-6.204, 106.857],
        [-6.222, 106.866],
        [-6.2395, 106.866],
      ],
    },

    {
      id: 2,
      name: "Titik Evakuasi 2",

      ETE_dijkstra: 45,
      status_dijkstra: "Safe",

      // Tanah Abang -> Sudirman -> Blok M
      geometry: [
        [-6.1875, 106.8106], // Tanah Abang
        [-6.1998, 106.817],
        [-6.2148, 106.8229], // Sudirman
        [-6.2338, 106.8135],
        [-6.2446, 106.7997], // Blok M
      ],

      ETE_dijkstra_rst: 38,
      status_dijkstra_rst: "Safe",

      // jalur alternatif lewat Senayan
      geometry_rst: [
        [-6.1875, 106.8106],
        [-6.203, 106.808],
        [-6.2205, 106.801],
        [-6.2345, 106.7995],
        [-6.2446, 106.7997],
      ],
    },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleRowClick = (point) => {
    setSelectedRow(point.id);

    setSelectedCell({
      rowId: null,
      type: null,
    });

    onShowRoutes([
      {
        geometry: point.geometry,
        color: "blue",
      },
      {
        geometry: point.geometry_rst,
        color: "orange",
      },
    ]);

    onMapFocus(point.geometry[0]);
  };

  const handleCellClick = (point, type, event) => {
    event.stopPropagation();

    setSelectedRow(null);

    setSelectedCell({
      rowId: point.id,
      type,
    });

    if (type === "dijkstra") {
      onShowRoutes([
        {
          geometry: point.geometry,
          color: "blue",
        },
      ]);

      onMapFocus(point.geometry[0]);
    }

    if (type === "dijkstra_rst") {
      onShowRoutes([
        {
          geometry: point.geometry_rst,
          color: "orange",
        },
      ]);

      onMapFocus(point.geometry_rst[0]);
    }
  };

  return (
    <Paper className="departure border" shadow="md" radius="lg" withBorder>
      <Flex direction="column" h="100%">
        {/* HEADER TOP */}
        <Flex
          className="panel-header border-bottom"
          justify="space-between"
          align="center"
          p="xs"
        >
          {/* kiri */}
          <Button
            variant="light"
            size="xs"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Kembali
          </Button>

          {/* tengah */}
          <Select
            w={160}
            label="Speed Walk"
            size="xs"
            value={selectedSpeedWalk}
            onChange={(value) => {
              if (value !== null) {
                setSelectedSpeedWalk(value);
              }
            }}
            allowDeselect={false}
            clearable={false}
            data={speedWalk.map((item) => ({
              value: item.value.toString(),
              label: `${item.name} (${item.value})`,
            }))}
          />

          {/* kanan */}
          <Text fw={700}>
            Scenario {scenario_id} - Departure {departure_point_id}
          </Text>
        </Flex>

        {/* TABLE HEADER */}
        <Flex className="table-header border-bottom">
          <Flex className="table-col evacuation-col" p="sm">
            <Text fw={700}>Titik Evakuasi</Text>
          </Flex>

          <Flex
            className="table-col algorithm-col border-left"
            direction="column"
            p="sm"
          >
            <Text fw={700}>Dijkstra</Text>
          </Flex>

          <Flex
            className="table-col algorithm-col border-left"
            direction="column"
            p="sm"
          >
            <Text fw={700}>Dijkstra + RsT</Text>
          </Flex>
        </Flex>

        {/* TABLE BODY */}
        {evacuationPoints.map((point) => {
          const isRowSelected = selectedRow === point.id;

          const isDijkstraSelected =
            selectedCell.rowId === point.id && selectedCell.type === "dijkstra";

          const isDijkstraRSTSelected =
            selectedCell.rowId === point.id &&
            selectedCell.type === "dijkstra_rst";

          return (
            <Flex
              key={point.id}
              className={`table-row border-bottom ${
                isRowSelected ? "selected-row" : ""
              }`}
            >
              {/* EVACUATION POINT */}
              <Flex
                className="table-col evacuation-col selectable-cell"
                p="sm"
                align="center"
                onClick={() => handleRowClick(point)}
              >
                <Text>{point.name}</Text>
              </Flex>

              {/* DIJKSTRA */}
              <Flex
                className={`table-col algorithm-col border-left selectable-cell ${
                  isDijkstraSelected ? "selected-cell" : ""
                }`}
                direction="column"
                p="sm"
                gap="xs"
                onClick={(event) => handleCellClick(point, "dijkstra", event)}
              >
                <Text size="sm">ETE: {point.ETE_dijkstra}</Text>

                <Text size="sm">Status: {point.status_dijkstra}</Text>
              </Flex>

              {/* DIJKSTRA + RST */}
              <Flex
                className={`table-col algorithm-col border-left selectable-cell ${
                  isDijkstraRSTSelected ? "selected-cell" : ""
                }`}
                direction="column"
                p="sm"
                gap="xs"
                onClick={(event) =>
                  handleCellClick(point, "dijkstra_rst", event)
                }
              >
                <Text size="sm">ETE: {point.ETE_dijkstra_rst}</Text>

                <Text size="sm">Status: {point.status_dijkstra_rst}</Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
}

export default Departure;
