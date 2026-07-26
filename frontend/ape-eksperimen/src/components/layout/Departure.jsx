import { Button, Flex, Paper, Select, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Departure.css";

function Departure({ onShowRoutes, onMapFocus, onSetNodes, onSetEdges }) {
  const navigate = useNavigate();
  const { scenario_id, departure_point_id } = useParams();

  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);

  const [selectedCell, setSelectedCell] = useState({
    rowId: null,
    type: null,
  });

  const speedWalk = [
    { id: 1, name: "", value: 1.35 },
    { id: 2, name: "", value: 1.4 },
    { id: 3, name: "", value: 1.51 },
  ];

  const [selectedSpeedWalk, setSelectedSpeedWalk] = useState(
    speedWalk[1].value.toString(),
  );

  const filterBySpeed = (data, speed) => {
    return data.filter((item) => item.movement_speed == Number(speed));
  };

  const evacuationPoints = useMemo(() => {
    return filterBySpeed(rawData, selectedSpeedWalk);
  }, [rawData, selectedSpeedWalk]);

  const parseRoute = (route) => {
    if (Array.isArray(route)) {
      return route;
    }

    if (typeof route !== "string" || route.trim() === "") {
      return [];
    }

    try {
      const parsedRoute = JSON.parse(route);
      return Array.isArray(parsedRoute) ? parsedRoute : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const formatRoute = (route) => {
    const parsedRoute = parseRoute(route);

    return parsedRoute.length > 0 ? parsedRoute.join(" → ") : "-";
  };

  const formatMinutes = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? `${numberValue.toFixed(2)} menit`
      : "-";
  };

  const getDijkstraEteColor = (point) => {
    const eteValue = Number(point.ete_dijkstra);
    const rstValue = Number(point.rst_dijkstra);

    if (!Number.isFinite(eteValue) || !Number.isFinite(rstValue)) {
      return "dark";
    }

    if (eteValue < rstValue) {
      return "green";
    }

    return "red";
  };

  const getUsulanSafeEteColor = (point) => {
    const eteValue = Number(point.ete_safe_dijkstra_rst);
    const rstValue = Number(point.rst_dijkstra_rst);

    if (!Number.isFinite(eteValue) || !Number.isFinite(rstValue)) {
      return "dark";
    }

    if (eteValue < rstValue) {
      return "green";
    }

    return "red";
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/scenarios/${scenario_id}/${departure_point_id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data");
        }

        const mappedData = (data.result || []).map((item) => {
          const dijkstraGeometry = JSON.parse(item.geometry_dijkstra);
          const dijkstraRstGeometry = JSON.parse(item.geometry_dijkstra_rst);

          return {
            id: item.id,
            name: item.evacuation_point_name,
            movement_speed: item.movement_speed,
            ete_dijkstra: item.ete_dijkstra,
            ete_safe_dijkstra: item.ete_safe_dijkstra,
            rst_dijkstra: item.rst_dijkstra,
            ete_dijkstra_rst: item.ete_dijkstra_rst,
            ete_safe_dijkstra_rst: item.ete_safe_dijkstra_rst,
            rst_dijkstra_rst: item.rst_dijkstra_rst,
            node_information_dijkstra: JSON.parse(
              item.node_information_dijkstra,
            ),
            edge_information_dijkstra: JSON.parse(
              item.edge_information_dijkstra,
            ),
            geometry_dijkstra: dijkstraGeometry,
            geometry_dijkstra_rst: dijkstraRstGeometry,
            node_information_dijkstra_rst: JSON.parse(
              item.node_information_dijkstra_rst,
            ),
            edge_information_dijkstra_rst: JSON.parse(
              item.edge_information_dijkstra_rst,
            ),
            route_dijkstra: parseRoute(item.route_dijkstra),
            route_dijkstra_rst: parseRoute(item.route_dijkstra_rst),
          };
        });

        setRawData(mappedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [scenario_id, departure_point_id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRowClick = (point) => {
    setSelectedRow(point.id);

    setSelectedCell({
      rowId: null,
      type: null,
    });

    onSetNodes(point.node_information_dijkstra);

    onShowRoutes([
      {
        geometry: point.geometry_dijkstra,
        color: "blue",
      },
      {
        geometry: point.geometry_dijkstra_rst,
        color: "orange",
      },
    ]);

    if (point.geometry_dijkstra?.length > 0) {
      onMapFocus(point.geometry_dijkstra[0]);
    }
  };

  const handleCellClick = (point, type, event) => {
    event.stopPropagation();

    setSelectedRow(null);

    setSelectedCell({
      rowId: point.id,
      type,
    });

    if (type === "dijkstra") {
      onSetNodes(point.node_information_dijkstra);
      onSetEdges(point.edge_information_dijkstra);

      onShowRoutes([
        {
          geometry: point.geometry_dijkstra,
          color: "blue",
        },
      ]);

      if (point.geometry_dijkstra?.length > 0) {
        onMapFocus(point.geometry_dijkstra[0]);
      }
    }

    if (type === "dijkstra_rst") {
      onSetNodes(point.node_information_dijkstra_rst);
      onSetEdges(point.edge_information_dijkstra_rst);

      onShowRoutes([
        {
          geometry: point.geometry_dijkstra_rst,
          color: "orange",
        },
      ]);

      if (point.geometry_dijkstra_rst?.length > 0) {
        onMapFocus(point.geometry_dijkstra_rst[0]);
      }
    }
  };

  if (loading) {
    return (
      <Paper className="departure border" shadow="md" radius="lg" withBorder>
        <Flex justify="center" align="center" h="100%">
          <Text>Loading...</Text>
        </Flex>
      </Paper>
    );
  }

  return (
    <Paper className="departure border" shadow="md" radius="lg" withBorder>
      <Flex direction="column" h="100%">
        <Flex
          className="panel-header border-bottom"
          justify="space-between"
          align="center"
          p="xs"
        >
          <Flex align="center" gap="sm">
            <Button
              variant="light"
              size="xs"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Kembali
            </Button>

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
          </Flex>

          <Flex direction="column" align="flex-end" gap={4}>
            <Text fw={700}>Hasil Evakuasi</Text>
            <Flex gap="sm" align="center" wrap="wrap" justify="flex-end">
              <Text size="xs" c="dimmed">
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#2f9e44",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                hijau = berhasil
              </Text>
              <Text size="xs" c="dimmed">
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#e03131",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                merah = gagal
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <div className="table-body">
          <div className="table-header table-grid border-bottom">
            <div className="table-col evacuation-col">
              <Text fw={700}>Titik Akhir</Text>
            </div>

            <div className="table-col metric-col border-left">
              <Text fw={700}>ETE Dijsktra</Text>
            </div>

            <div className="table-col rst-col border-left">
              <Text fw={700}>RsT</Text>
              <Text size="xs" c="dimmed">
                batas waktu aman
              </Text>
            </div>

            <div className="table-col route-col border-left">
              <Text fw={700}>Rute Dijsktra</Text>
            </div>

            <div className="table-col metric-col border-left">
              <Text fw={700}>ETE Model Usulan</Text>
            </div>

            <div className="table-col safe-col border-left">
              <Text fw={700}>ETE Safe Model Usulan</Text>
            </div>

            <div className="table-col rst-col border-left">
              <Text fw={700}>RsT</Text>
              <Text size="xs" c="dimmed">
                batas waktu aman
              </Text>
            </div>

            <div className="table-col route-col border-left">
              <Text fw={700}>Rute Model Usulan</Text>
            </div>
          </div>

          {evacuationPoints.map((point) => {
            const isRowSelected = selectedRow === point.id;

            const isDijkstraSelected =
              selectedCell.rowId === point.id &&
              selectedCell.type === "dijkstra";

            const isDijkstraRSTSelected =
              selectedCell.rowId === point.id &&
              selectedCell.type === "dijkstra_rst";

            return (
              <div
                key={point.id}
                className={`table-row table-grid border-bottom ${
                  isRowSelected ? "selected-row" : ""
                }`}
              >
                <div
                  className="table-col evacuation-col selectable-cell"
                  onClick={() => handleRowClick(point)}
                >
                  <Text>{point.name}</Text>
                </div>

                <div
                  className={`table-col metric-col border-left selectable-cell ${
                    isDijkstraSelected ? "selected-cell" : ""
                  }`}
                  onClick={(event) => handleCellClick(point, "dijkstra", event)}
                >
                  <Text size="sm" c={getDijkstraEteColor(point)}>
                    {formatMinutes(point.ete_dijkstra)}
                  </Text>
                </div>

                <div
                  className={`table-col rst-col border-left selectable-cell ${
                    isDijkstraSelected ? "selected-cell" : ""
                  }`}
                  onClick={(event) => handleCellClick(point, "dijkstra", event)}
                >
                  <Text size="sm">{formatMinutes(point.rst_dijkstra)}</Text>
                </div>

                <div className="table-col route-col border-left selectable-cell">
                  <Text size="sm" className="route-text">
                    {formatRoute(point.route_dijkstra)}
                  </Text>
                </div>

                <div
                  className={`table-col metric-col border-left selectable-cell ${
                    isDijkstraRSTSelected ? "selected-cell" : ""
                  }`}
                  onClick={(event) =>
                    handleCellClick(point, "dijkstra_rst", event)
                  }
                >
                  <Text size="sm">{formatMinutes(point.ete_dijkstra_rst)}</Text>
                </div>

                <div
                  className={`table-col safe-col border-left selectable-cell ${
                    isDijkstraRSTSelected ? "selected-cell" : ""
                  }`}
                  onClick={(event) =>
                    handleCellClick(point, "dijkstra_rst", event)
                  }
                >
                  <Text size="sm" c={getUsulanSafeEteColor(point)}>
                    {formatMinutes(point.ete_safe_dijkstra_rst)}
                  </Text>
                </div>

                <div
                  className={`table-col rst-col border-left selectable-cell ${
                    isDijkstraRSTSelected ? "selected-cell" : ""
                  }`}
                  onClick={(event) =>
                    handleCellClick(point, "dijkstra_rst", event)
                  }
                >
                  <Text size="sm">{formatMinutes(point.rst_dijkstra_rst)}</Text>
                </div>

                <div className="table-col route-col border-left selectable-cell">
                  <Text size="sm" className="route-text">
                    {formatRoute(point.route_dijkstra_rst)}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </Flex>
    </Paper>
  );
}

export default Departure;
