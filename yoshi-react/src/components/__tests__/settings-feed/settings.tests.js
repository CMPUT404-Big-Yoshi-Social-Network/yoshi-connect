import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';
import Settings from "../../feeds/settings/settings.jsx";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<BrowserRouter><Settings/></BrowserRouter>);
});