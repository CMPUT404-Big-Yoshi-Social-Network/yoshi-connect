import React from "react";
import axios from 'axios';
import EditComment from "./editComment";
import Popup from 'reactjs-popup';

function Comment(props) {
    const deleteComment = () => {
        console.log("Debug: Deleting comment");
        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: "/server/authors/" + props.authorId + "/posts/" + props.postId,
            headers: { 'Content-Type': 'application/json' },
            data: {
                commenter: props.commenter,
                commentId: props._id,
                authorId: props.authorId,
                postId: props.postId,
                status: "Remove comment"
            }
        };
        axios.delete("/server/authors/" + props.authorId + "/posts/" + props.postId, config).then((response) => {}).catch((error) => { console.log(error); });
    }
    return (
        <div id='comment'>
            <h4>{ props.viewerId }</h4>
            { props.comment }
            {
                props.commenter !== props.viewerId ? null : <Popup trigger={<button>Edit</button>}><EditComment {...props}/></Popup>
            }    
            {
                props.commenter !== props.viewerId ? null : <button onClick={deleteComment}>Delete</button>
            }    
        </div>
    )
}

export default Comment;