import { render } from "@testing-library/react";
import Settings from "../../../feeds/settings/settings.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<BrowserRouter><Settings/></BrowserRouter>);
});