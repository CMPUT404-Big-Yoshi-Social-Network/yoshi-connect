import { render } from "@testing-library/react";
import Messages from "../../../feeds/messages/messages.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<BrowserRouter><Messages/></BrowserRouter>);

});