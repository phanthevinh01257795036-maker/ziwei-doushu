import React from "react";
import { createRoot } from "react-dom/client";
import ViApp from "../components/vi/ViApp";
createRoot(document.getElementById("root")!).render(<ViApp assetBase="./" />);
