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
import React from "react";

// Child Component
import TopNav from '../feeds/topNav';
import LeftNavBar from '../feeds/leftNav.jsx';
import RightNavBar from '../feeds/rightNav.jsx';

// Styling
import './password.css';

function PasswordChange({authorId}) {
    /**
     * Description: Represents the change password page in settings
     * Functions: N/A
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    return (
        <div>
            <TopNav authorId={authorId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={authorId}/>
                </div>
                <div className='pubColM'>
                    IN CONSTRUCTION
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default PasswordChange;