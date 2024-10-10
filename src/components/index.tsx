import "../tailwind.css";
import "../tailwind.config.js";
import "../globals.css";
import React from "react";
import ReactDOMClient from "react-dom/client";
import { InitiateChat } from "./screens/InitiateChat";

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app as HTMLElement);
root.render(<InitiateChat />);
