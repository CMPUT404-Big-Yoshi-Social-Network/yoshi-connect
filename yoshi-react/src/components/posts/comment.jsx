import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Comment(props) {
    const { veiwerId } = props;
    const { commenter, comment } = useParams();

    return (
        <div>
            <h3>{commenter}</h3>
            <p>{comment}</p>
        </div>
    )
}

export default Comment;