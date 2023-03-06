import { render, screen, fireEvent } from "@testing-library/react";
import Welcome from "../../welcome/welcome.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("on inital render, the sign up button is there", async () => {
    // render the component on virtual dom
    render(<BrowserRouter><Welcome/></BrowserRouter>);

    //select the elements you want to interact with
    const signupButton = screen.getByTestId("signup");
    // const incrementBtn = screen.getByTestId("increment");

    //interact with those elements
    fireEvent.click(signupButton);

    //assert the expected result
    await expect(signupButton).toBeEnabled();
});