import React from "react";
import Post from './post.jsx';

function Posts(props) { 
    const posts = props.posts;
    return (
        <div>
            {Object.keys(posts).map((post, idx) => (
                <Post key={idx} viewerId={props.viewerId} authorId={props.authorId} {...posts[post]}/>
            ))}     
        </div>
    )
}

export default Posts;