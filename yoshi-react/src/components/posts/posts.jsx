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

// Functionality
import React from "react";

// Child Component
import Post from './post.jsx';

function Posts({viewerId, url}) { 
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [seeMore, setSeeMore] = useState(true);
    const size = 5;

    useEffect(() => {
        console.log('Debug: Fetching all public posts.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: page,
                size: size
            }
        }

        axios
        .get(url, config)
        .then((response) => { 
            let posts = []
            for (let i = 0; i < size; i++) {
                posts.push(response.data.items[i]);
            }
            setPosts(posts);
        })
        .catch(err => {
            if (err.response.status === 404) {
                setPosts([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }, [setPosts, url, navigate, page, size]);

    const getMore = () => {
        //TODO
        ;
    }
    
    return (
        <div>
            { posts === undefined || posts.length === 0 ? 
                <div>
                    <h4>No posts to show.</h4>
                </div> : 
                <div> 
                    <Pagination>
                        {Object.keys(posts).map((post, idx) => (
                            <Post key={idx} viewerId={viewerId} post={posts[post]}/>
                        ))}  
                        <Pagination.Next onClick={getMore}/>
                    </Pagination>  
                </div>
            }
        </div>
    )
}

export default Posts;