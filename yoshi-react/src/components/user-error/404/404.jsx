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
import React from 'react';

// User Interface
import { Image } from 'react-bootstrap'

// Styling
import './404.css'

function PageNotFound() {
    /**
     * Description: Represents a Page Not Found Error (Status 404)
     * Returns: N/A
     */
    return (
        <div className="sc404">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <h3>NOT FOUND</h3>
            <Image src='/images/status_code_404.png'/>
        </div>
    )
}

export default PageNotFound;