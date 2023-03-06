import { render } from "@testing-library/react";
import Signup from "../../signup/signup,jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<BrowserRouter><Signup/></BrowserRouter>);
});