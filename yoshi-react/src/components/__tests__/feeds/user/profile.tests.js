import { render, screen, cleanup } from "@testing-library/react";
import renderer from "react-test-renderer";
import Profile from "../../../feeds/profile/profile";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<Profile />); 

});