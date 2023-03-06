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

import { Image } from 'react-bootstrap'
import React from 'react';
import './401.css'

function UserUnauthorized() {
    return (
        <div className="sc401">
            <h1>401</h1>
            <h2>Your authorization failed</h2>
            <h3>UNAUTHORIZED</h3>
            <Image src='/images/status_code_401.png'/>
        </div>
    )
}

export default UserUnauthorized;