import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./Home.tsx";
import ErrorPage from "./ErrorPage.tsx";
import { Metrics } from "./Metrics.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Home />,
  },
  {
    path: "/metrics",
    errorElement: <ErrorPage />,
    element: <Metrics />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
