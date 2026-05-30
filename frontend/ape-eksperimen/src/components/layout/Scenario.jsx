import { Button, Flex, Paper, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Scenario.css";

function Scenario() {
  const navigate = useNavigate();
  const { scenario_id } = useParams();

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scenarios/${scenario_id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data");
        }

        setPersons(Object.values(data.persons ?? {}));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [scenario_id]);

  const handleClick = (person) => {
    navigate(`/result/${scenario_id}/${person.person_id}`);
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

          <Text fw={700}>Daftar Person</Text>
        </Flex>

        {loading ? (
          <Text p="md">Loading...</Text>
        ) : (
          persons.map((person, index) => (
            <Flex
              key={person.person_id}
              className="border-bottom departure-item"
              direction="column"
              align="stretch"
              w="100%"
              p="xs"
              gap="sm"
              onClick={() => handleClick(person)}
              style={{ cursor: "pointer" }}
            >
              <h2>Person {index + 1}</h2>

              <Flex direction="row" gap="xs">
                <Text size="sm">
                  Latitude: {Number(person.latitude).toFixed(6)}
                </Text>

                <Text size="sm">
                  Longitude: {Number(person.longitude).toFixed(6)}
                </Text>
              </Flex>
            </Flex>
          ))
        )}
      </Flex>
    </Paper>
  );
}

export default Scenario;
