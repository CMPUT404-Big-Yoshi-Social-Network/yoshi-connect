import React from "react";
import Post from './post.jsx';

function Posts(props) { 
    const posts = props.posts;
    const postsExist = props.posts.length !== 0;

    return (
        <div>
            { !postsExist ?  null : 
                <div>
                    {Object.keys(posts).map((post, idx) => (
                        <Post key={idx} {...posts[post]}/>
                    ))}     
                </div>
            }
        </div>
    )
}

export default Posts;