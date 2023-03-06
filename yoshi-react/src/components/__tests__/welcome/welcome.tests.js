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

import { render, screen, fireEvent } from "@testing-library/react";
import Welcome from "../../welcome/welcome.jsx";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

//test block
test("on inital render, the sign up button is there", async () => {
    // render the component on virtual dom
    render(<BrowserRouter><Welcome/></BrowserRouter>);

    //select the elements you want to interact with
    const signupButton = screen.getByTestId("signup");
    // const incrementBtn = screen.getByTestId("increment");

    //interact with those elements
    fireEvent.click(signupButton);

    //assert the expected result
    expect(signupButton).toBeEnabled();
});