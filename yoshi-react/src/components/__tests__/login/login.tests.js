import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import Login from "../../login/login";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Login />); 

});