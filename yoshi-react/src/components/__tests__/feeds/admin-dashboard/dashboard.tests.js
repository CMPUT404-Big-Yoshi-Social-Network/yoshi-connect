import { render, screen, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import AdminDashboard from "../../../admin/adminDashboard";
import "@testing-library/jest-dom";

//test block
test("test description here", () => {
    // render the component on virtual dom
    render(<AdminDashboard />); 

});