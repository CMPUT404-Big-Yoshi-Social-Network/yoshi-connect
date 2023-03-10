/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Functionality
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

// Tested Component
import Welcome from "../../welcome/welcome.jsx";

test("on inital render, the sign up button is there", async () => {
    render(<BrowserRouter><Welcome/></BrowserRouter>);
    const signupButton = screen.getByTestId("signup");
    fireEvent.click(signupButton);
    expect(signupButton).toBeEnabled();
});

test("on inital render, the login button is there", async () => {
    render(<BrowserRouter><Welcome/></BrowserRouter>);
    const loginButton = screen.getByTestId("login");
    fireEvent.click(loginButton);
    expect(loginButton).toBeEnabled();
});