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