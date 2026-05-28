import { Button, Paper, Stack } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

import Result from "../../assets/icons/Result";
import Dataset from "../../assets/icons/Dataset";
import Simulation from "../../assets/icons/Simulation";

import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = location.pathname;

  const isResultActive = activePath.startsWith("/result");

  return (
    <Paper className="sidebar" shadow="md" radius="lg" withBorder p="sm">
      <Stack gap="xs">
        <Button
          className="sidebar-button"
          variant={activePath === "/simulation" ? "filled" : "light"}
          color="blue"
          fullWidth
          size="xs"
          data-active={activePath === "/simulation"}
          onClick={() => navigate("/simulation")}
        >
          <div className="sidebar-button-content">
            <Simulation
              color={activePath === "/simulation" ? "#ffffff" : "#000000"}
            />

            <span>Simulation</span>
          </div>
        </Button>

        <Button
          className="sidebar-button"
          variant={activePath === "/dataset" ? "filled" : "light"}
          color="blue"
          fullWidth
          size="xs"
          data-active={activePath === "/dataset"}
          onClick={() => navigate("/dataset")}
        >
          <div className="sidebar-button-content">
            <Dataset
              color={activePath === "/dataset" ? "#ffffff" : "#000000"}
            />

            <span>Dataset</span>
          </div>
        </Button>

        <Button
          className="sidebar-button"
          variant={isResultActive ? "filled" : "light"}
          color="blue"
          fullWidth
          size="xs"
          data-active={isResultActive}
          onClick={() => navigate("/result")}
        >
          <div className="sidebar-button-content">
            <Result color={isResultActive ? "#ffffff" : "#000000"} />

            <span>Result</span>
          </div>
        </Button>
      </Stack>
    </Paper>
  );
};

export default Sidebar;
