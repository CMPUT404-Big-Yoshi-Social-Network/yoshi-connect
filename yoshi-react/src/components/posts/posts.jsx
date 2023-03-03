import axios from 'axios';
import React, { useEffect, useState } from "react";
import Post from './post.jsx';
// const mongoose = require('mongoose');
// mongoose.set('strictQuery', true);
// const database = mongoose.connection;
// const Author = database.model('Author', author_scheme);
// const Following = database.model('Following', following_scheme);
// const Friend = database.model('Friend', friend_scheme);

function Posts(props) { 
    const following = [];
    const username = "165250b3-16cb-4617-a54f-df8f6c1f5fa5";
    // Author.foreach((author) => {
    //     let author_id = author._id;
    //     let author_name = author.username;
    //     Friend.find({author_name}).foreach((friends) => {
    //         if (friends.following.includes(author_id)) {
    //             following.push(author_id);
    //         } else {
    //             Following.find(author_name).foreach((followings) => {
    //                 if (followings.following.includes(friend)) {
    //                     following.push(author_id);
    //                 }
    //             })
    //         }

    //     })
    // })

    const getPosts = (author_id) => {
        let config = {
            method: "get",
            maxBodyLength: "Infinity",
            url: "/server/authors/" + author_id + "/posts/",
            headers: {
                "Content-Type": "application/json"
            }
        }
        axios(config).then((response) => {}).catch((error) => { console.log(error); });
    }


    return (
        <div>
            <div>PLS WORK</div>
            {/* {Object.keys(posts).map((post, username) => (
                <Post username={username} {...posts[post]}/>
            ))}               */}
            {getPosts(username)}
        </div>
    )
}

export default Posts;