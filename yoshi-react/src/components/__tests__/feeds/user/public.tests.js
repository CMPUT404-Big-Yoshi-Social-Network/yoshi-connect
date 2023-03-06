import { render } from "@testing-library/react";
import Public from "../../../feeds/public/public.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("test description here", async () => {
    // render the component on virtual dom
    render(<BrowserRouter><Public/></BrowserRouter>);
});