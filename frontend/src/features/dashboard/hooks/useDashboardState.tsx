import { useContext } from "react";
import { DashboardStateContext } from "../context/DashboardContext";

const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }

  return context;
};

export default useDashboardState;
