import React from "react";
import Post from './post.jsx';

function Posts({viewerId, posts}) { 
    return (
        <div>
            { (posts === undefined) ? null : 
                <div>
                    {Object.keys(posts).map((post, idx) => (
                        <Post key={idx} viewerId={viewerId} post={posts[post]}/>
                    ))}     
                </div>
            }
        </div>
    )
}

export default Posts;