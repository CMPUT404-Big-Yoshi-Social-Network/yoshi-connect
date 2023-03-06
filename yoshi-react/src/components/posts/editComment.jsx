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

import axios from 'axios';
import React, { useState } from "react";
import './create.css';

function EditComment(props) {
    const [data, setData] = useState({
        comment: props.comment
    })
    
    const modifyComment = () => {
        console.log('Debug: Modifying a post')
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/authors/' + props.authorId + '/posts/' + props.postId,
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            data: {
                commenter: props.commenter,
                comment: data.comment,
                commentId: props._id,
                authorId: props.authorId,
                postId: props.postId,
                status: "Modify comment"
            }
        }
        
        axios.put('/server/authors/' + props.authorId + '/posts/' + props.postId, config)
        .then((response) => { })
        .catch((e) =>{ console.log(e); })
    }

    return (
        props.commenter !== props.viewerId ? null :
            <div className='editBackground'>
            <form method='PUT'>
                <label>
                    Comment:
                    <br></br>
                    <input type="text" name="comment" defaultValue={props.comment} onChange={(e) => {
                        setData({
                        ...data,
                        comment: e.target.value
                        })
                    }}/>
                </label>
            </form>
            <button className={"updateComment"} type={"button"} onClick={modifyComment}>Update</button>
        </div>
    )
}

export default EditComment;