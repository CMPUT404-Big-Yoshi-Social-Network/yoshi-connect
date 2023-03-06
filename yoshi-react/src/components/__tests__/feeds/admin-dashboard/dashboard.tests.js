import { render } from "@testing-library/react";
import AdminDashboard from "../../../admin/adminDashboard.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

test("test description here", async () => {
    render(<BrowserRouter><AdminDashboard/></BrowserRouter>);
});