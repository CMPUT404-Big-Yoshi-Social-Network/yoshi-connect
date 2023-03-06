import { render } from "@testing-library/react";
import Login from "../../login/login.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("test description here", async () => {
    // render the component on virtual dom
    render(<BrowserRouter><Login/></BrowserRouter>);

});