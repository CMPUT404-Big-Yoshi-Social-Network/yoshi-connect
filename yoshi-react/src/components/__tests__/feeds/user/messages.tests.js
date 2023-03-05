import { render, screen, cleanup } from "@testing-library/react";
import renderer from "react-test-renderer";
import Messages from "../../../feeds/messages/messages";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Messages />); 

});