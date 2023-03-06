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
import './403.css'

function UserForbidden() {
    /**
     * Description: Represents Status 403 for pages that are forbidden by specific authors 
     * Returns: N/A
     */
    return (
        <div className="sc403">
            <h1>403</h1>
            <h2>You don't have permission to access this resource</h2>
            <h3>FORBIDDEN</h3>
            <Image src='/images/status_code_403.png'/>
        </div>
    )
}

export default UserForbidden;