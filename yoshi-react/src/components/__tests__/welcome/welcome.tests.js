import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import welcome from "../../welcome/welcome";
import "@testing-library/jest-dom";

import Counter from "../components/Counter";

//test block
test("should click on sign up button", () => {
// render the component on virtual dom
render(<welcome />);

//select the elements you want to interact with
const signupButton = screen.getByTestId("signup");
const incrementBtn = screen.getByTestId("increment");

//interact with those elements
fireEvent.click(signupButton);

//assert the expected result
expect(signupButton).toHaveTextContent("1");
});