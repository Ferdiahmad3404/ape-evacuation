import { Flex, Paper, Text, Button } from "@mantine/core";
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

  const handleDelete = async (e, scenarioId) => {
    e.stopPropagation();

    // ✅ CONFIRMATION ALERT
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus scenario ini?",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/scenarios/${scenarioId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus scenario");
      }

      setScenarios((prev) => prev.filter((item) => item.id !== scenarioId));
    } catch (error) {
      console.error(error);
    }
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
      {scenarios.length === 0 ? (
        <Flex p="md">
          <Text>Tidak ada scenario.</Text>
        </Flex>
      ) : (
        scenarios.map((scenario) => (
          <Flex
            key={scenario.id}
            className="border-bottom result-item"
            justify="space-between"
            align="center"
            p="xs"
            onClick={() => handleClick(scenario.id)}
          >
            <Text fw={600} className="scenario-text">
              {scenario.name}
            </Text>

            <Button
              color="red"
              size="xs"
              onClick={(e) => handleDelete(e, scenario.id)}
            >
              Delete
            </Button>
          </Flex>
        ))
      )}
    </Paper>
  );
}

export default Result;
