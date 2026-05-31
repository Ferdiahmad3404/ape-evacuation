import { Flex, Paper, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Result.css";

function Result() {
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/scenarios");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data");
        }

        setScenarios(data.scenarios ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const handleClick = (scenarioId) => {
    navigate(`/result/${scenarioId}`);
  };

  if (loading) {
    return (
      <Paper className="result border" shadow="md" radius="lg" withBorder>
        <Flex p="md">
          <Text>Loading...</Text>
        </Flex>
      </Paper>
    );
  }

  return (
    <Paper className="result border" shadow="md" radius="lg" withBorder>
      <Flex direction="column">
        {scenarios.length === 0 ? (
          <Flex p="md">
            <Text>Tidak ada scenario.</Text>
          </Flex>
        ) : (
          scenarios.map((scenarioId, index) => (
            <Flex
              key={scenarioId}
              className="border-bottom result-item"
              direction="column"
              align="stretch"
              w="100%"
              p="xs"
              gap="sm"
              onClick={() => handleClick(scenarioId)}
              style={{ cursor: "pointer" }}
            >
              <h2>Scenario {index + 1}</h2>
            </Flex>
          ))
        )}
      </Flex>
    </Paper>
  );
}

export default Result;
