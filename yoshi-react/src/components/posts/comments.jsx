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
import Pagination from 'react-bootstrap/Pagination';
import { useState, useEffect } from 'react';
import axios from 'axios';

// User Interface
import Comment from './comment.jsx';

function Comments(params) {
    /**
     * Description: Represents an array of Comments
     * Functions: 
     *     - useEffect: Fetches the the comments related to the url
     * Returns: N/A
     */
    console.log('Debug: Comments() <TLDR what the function is doing>')

    const [comments, setComments] = useState([]);

    useEffect(() => {
        /**
         * Description: Fetches the the comments related to the url through sending a GET request
         * Request: GET
         * Returns: N/A
         */
        console.log(params.url)
        axios.get(params.url)
        .then((response) => {
            if(response.data.comments){
                setComments(response.data.comments);
            }
         })
        .catch((err) => {
            setComments([]);
         });
    }, [params.url]);
    return (
        <div>
            { comments.length === 0 ? 
                <div>
                    <h4>No comments to show.</h4>
                </div> : 
                <div> 
                    <Pagination>
                        {Object.keys(comments).map((comment, idx) => (
                            <Comment key={idx} comment={comments[comment]} author={params.author} url={params.url}/>
                        ))}  
                    </Pagination>  
                </div>
            }
        </div>
    )
}

export default Comments;