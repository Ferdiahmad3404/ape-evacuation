import { Flex, Paper, Text } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";

import "./Result.css";

function Result() {
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 1,
      name: "Scenario 1",
    },
    {
      id: 2,
      name: "Scenario 2",
    },
    {
      id: 3,
      name: "Scenario 3",
    },
  ];

  const handleClick = (scenario) => {
    navigate(`/result/${scenario.id}`);
  };

  return (
    <Paper className="result border" shadow="md" radius="lg" withBorder>
      <Flex direction="column">
        {scenarios.map((scenario) => (
          <Flex
            key={scenario.id}
            className="border-bottom result-item"
            direction="column"
            align="stretch"
            w="100%"
            p="xs"
            gap="sm"
            onClick={() => handleClick(scenario)}
            style={{ cursor: "pointer" }}
          >
            <h2>{scenario.name}</h2>
          </Flex>
        ))}
      </Flex>
    </Paper>
  );
}

export default Result;
