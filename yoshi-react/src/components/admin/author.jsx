import React from "react";

function Author(props) {
    const { username } = props;
    const modifyAuthor = () => {
        console.log('Debug: Modifying this author')
    }
    const deleteAuthor = () => {
        console.log('Debug: Deleting this author')
    }
    return (
        <div id='author'>
            { username }
            <button type="button" id='modify' onClick={() => modifyAuthor()}>Modify</button>
            <button type="button" id='delete' onClick={() => deleteAuthor()}>Delete</button>
        </div>
    )
}

export default Author;