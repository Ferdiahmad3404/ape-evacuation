import { Button, Flex, Paper } from "@mantine/core";
import { useState } from "react";
import "./Dataset.css";

function Dataset() {
  const [nodesFile, setNodesFile] = useState(null);
  const [edgesFile, setEdgesFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nodesFile || !edgesFile) {
      alert("Nodes dan Edges wajib diupload");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("nodes_file", nodesFile);
      formData.append("edges_file", edgesFile);

      const response = await fetch("http://localhost:5000/api/datasets", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Upload gagal");
        return;
      }

      alert("Upload berhasil");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
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

            <input
              type="file"
              accept=".csv"
              onChange={(event) =>
                setNodesFile(event.target.files?.[0] ?? null)
              }
            />
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

            <input
              type="file"
              accept=".csv"
              onChange={(event) =>
                setEdgesFile(event.target.files?.[0] ?? null)
              }
            />
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
