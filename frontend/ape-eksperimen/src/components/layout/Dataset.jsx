import { Button, Flex, Paper } from "@mantine/core";
import { useState } from "react";
import "./Dataset.css";

function Dataset() {
  const [nodesFile, setNodesFile] = useState(null);
  const [edgesFile, setEdgesFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <Paper className="dataset border" shadow="md" radius="lg" withBorder>
      <Flex
        component="form"
        onSubmit={handleSubmit}
        direction="column"
        justify="space-between"
        h="100%"
      >
        <Flex direction="column">
          <Flex
            className="border-bottom"
            direction="column"
            align="stretch"
            w="100%"
            p="xs"
            bg="#D9D9D9"
          >
            <h2>Nodes</h2>
            <Flex
              justify="space-between"
              direction="row"
              align="center"
              gap="xs"
              w="100%"
            >
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(event) =>
                  setNodesFile(event.target.files?.[0] ?? null)
                }
              />
            </Flex>
          </Flex>
          <Flex
            className="border-bottom"
            direction="column"
            align="stretch"
            w="100%"
            p="xs"
            bg="#D9D9D9"
          >
            <h2>Edges</h2>
            <Flex
              justify="space-between"
              direction="row"
              align="center"
              gap="xs"
              w="100%"
            >
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(event) =>
                  setEdgesFile(event.target.files?.[0] ?? null)
                }
              />
            </Flex>
          </Flex>
        </Flex>
        <Button type="submit" radius="0px">
          Upload Dataset
        </Button>
      </Flex>
    </Paper>
  );
}

export default Dataset;
