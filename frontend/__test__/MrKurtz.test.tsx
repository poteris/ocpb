import React from "react";
import { render, screen } from "@testing-library/react";
import { MrKurtz } from "./MrKurtz";
import "@testing-library/jest-dom";

test("renders Mr Kurtz!", () => {
  render(<MrKurtz />);
  expect(screen.getByText("Mr Kurtz - He Dead!")).toBeInTheDocument();
});
