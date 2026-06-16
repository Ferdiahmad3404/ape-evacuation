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
    { id: 2, name: "", value: 1.40 },
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
            ete_dijkstra_rst: item.ete_dijkstra_rst,
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

          <Text fw={700}>Hasil Evakuasi</Text>
        </Flex>

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
            className="table-col route-col border-left"
            direction="column"
            p="sm"
          >
            <Text fw={700}>Route Dijkstra</Text>
          </Flex>

          <Flex
            className="table-col algorithm-col border-left"
            direction="column"
            p="sm"
          >
            <Text fw={700}>Dijkstra + RsT</Text>
          </Flex>

          <Flex
            className="table-col route-col border-left"
            direction="column"
            p="sm"
          >
            <Text fw={700}>Route Dijkstra + RsT</Text>
          </Flex>
        </Flex>

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
              <Flex
                className="table-col evacuation-col selectable-cell"
                p="sm"
                align="center"
                onClick={() => handleRowClick(point)}
              >
                <Text>{point.name}</Text>
              </Flex>

              <Flex
                className={`table-col algorithm-col border-left selectable-cell ${
                  isDijkstraSelected ? "selected-cell" : ""
                }`}
                direction="column"
                p="sm"
                gap="xs"
                onClick={(event) => handleCellClick(point, "dijkstra", event)}
              >
                <Text size="sm">
                  {Number(point.ete_dijkstra).toFixed(2)} menit
                </Text>
              </Flex>

              <Flex
                className="table-col route-col border-left selectable-cell"
                direction="column"
                p="sm"
              >
                <Text size="sm" className="route-text">
                  {formatRoute(point.route_dijkstra)}
                </Text>
              </Flex>

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
                <Text size="sm">
                  {Number(point.ete_dijkstra_rst).toFixed(2)} menit
                </Text>
              </Flex>

              <Flex
                className="table-col route-col border-left selectable-cell"
                direction="column"
                p="sm"
              >
                <Text size="sm" className="route-text">
                  {formatRoute(point.route_dijkstra_rst)}
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
}

export default Departure;
