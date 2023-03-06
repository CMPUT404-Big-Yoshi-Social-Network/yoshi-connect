import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import Public from "../../../feeds/public/public";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Public />); 

});