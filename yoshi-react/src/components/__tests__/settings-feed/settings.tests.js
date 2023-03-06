import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import Settings from "../../feeds/settings/settings";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Settings />); 

});