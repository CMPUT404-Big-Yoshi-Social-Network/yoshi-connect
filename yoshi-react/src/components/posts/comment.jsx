import React from "react";

function Comment(props) {
    return (
        <div id='comment'>
            <h4>{ props.authorId }</h4>
            { props.comment }
        </div>
    )
}

export default Comment;