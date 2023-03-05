import React from "react";

function Comment(props) {
    return (
        <div id='comment'>
            { props.authorId }
            { props.comment }
        </div>
    )
}

export default Comment;