import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import Signup from "../../signup/signup";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Signup />); 

});