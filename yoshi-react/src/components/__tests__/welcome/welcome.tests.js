import { render, screen, cleanup } from "@testing-library/react";
import renderer from "react-test-renderer";
import welcome from "../../welcome/welcome";
import "@testing-library/jest-dom";

import Counter from "../components/Counter";

//test block
test("increments counter", () => {
// render the component on virtual dom
render(<Counter />);

//select the elements you want to interact with
const counter = screen.getByTestId("counter");
const incrementBtn = screen.getByTestId("increment");

//interact with those elements
fireEvent.click(incrementBtn);

//assert the expected result
expect(counter).toHaveTextContent("1");
});