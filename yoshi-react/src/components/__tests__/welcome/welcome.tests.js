import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import Welcome from "../../welcome/welcome";
import "@testing-library/jest-dom";

//test block
test("on inital render, the sign up button is there", () => {
// render the component on virtual dom
render(<Welcome />);

//select the elements you want to interact with
const signupButton = screen.getByTestId("signup");
// const incrementBtn = screen.getByTestId("increment");

//interact with those elements
fireEvent.click(signupButton);

//assert the expected result
expect(signupButton).toBeEnabled();
});