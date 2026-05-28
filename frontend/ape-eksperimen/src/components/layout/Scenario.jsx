import { Button, Flex, Paper, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import "./Scenario.css";

function Scenario() {
  const navigate = useNavigate();

  const { scenario_id } = useParams();

  const departurePoint = [
    {
      id: 1,
      name: "Titik Keberangkatan 1",
      lat: -6.2,
      lng: 106.816666,
    },
    {
      id: 2,
      name: "Titik Keberangkatan 2",
      lat: -6.3,
      lng: 106.816666,
    },
    {
      id: 3,
      name: "Titik Keberangkatan 3",
      lat: -6.4,
      lng: 106.816666,
    },
  ];

  const handleClick = (point) => {
    navigate(`/result/${scenario_id}/${point.id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Paper className="scenario border" shadow="md" radius="lg" withBorder>
      <Flex direction="column">
        <Flex
          justify="space-between"
          align="center"
          p="xs"
          className="border-bottom"
        >
          <Button
            variant="light"
            size="xs"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Kembali
          </Button>

          <Text fw={700}>Scenario {scenario_id}</Text>
        </Flex>

        {departurePoint.map((point) => (
          <Flex
            key={point.id}
            className="border-bottom departure-item"
            direction="column"
            align="stretch"
            w="100%"
            p="xs"
            gap="sm"
            onClick={() => handleClick(point)}
            style={{ cursor: "pointer" }}
          >
            <h2>{point.name}</h2>

            <Flex direction="row" gap="xs">
              <Text size="sm">Latitude: {point.lat}</Text>

              <Text size="sm">Longitude: {point.lng}</Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Paper>
  );
}

export default Scenario;
