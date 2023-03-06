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

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { PostHistory, Post, Like, Comment, PublicPost } = require('../dbSchema/postScheme.js');
const { Friend } = require('../dbSchema/authorScheme.js');

async function createPostHistory(author_id){
    /**
     * Description: Creates and saves the author's post history 
     * Returns: N/A
     */
    console.log('Debug: Creating post history for user')
    let new_post_history = new PostHistory ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()

    return;
}

async function addLike(req, res){
    /**
     * Description: Adds a like to the author's post to the database 
     * Returns: A boolean status if the like is successfully saved into the database
     *          The number of likes the post has
     */
    console.log('Debug: Adding a like')
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let publicPost = await PublicPost.find();
    let success = false;
    let numLikes = 0;

    var like = new Like({
        liker: req.body.data.liker
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        let likerIdx = postHistory.posts[idx].likes.map(obj => obj.liker).indexOf(like.liker);
        if (likerIdx <= -1) {
            console.log('Debug: Adding that like!')
            postHistory.posts[idx].likes.push(like);
            numLikes = postHistory.posts[idx].likes.length;
            await postHistory.save();
            success = true;

            for (let i = 0; i < publicPost[0].posts.length; i++) {
                if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                    publicPost[0].posts[i].post.likes.push(like);
                    numLikes = publicPost[0].posts[i].post.likes.length;
                    await publicPost[0].save();
                }
            }
        }
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numLikes: numLikes })
}

async function deleteLike(req, res){
    /**
     * Description: Removes a like from the author's post in the database 
     * Returns: A boolean status if the like is successfully removed from the database
     *          The number of likes the post has
     */
    console.log('Debug: Removing a like')
    let success = false;
    let numLikes = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the like.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                let like_idx = history.posts[post_idx].likes.map(obj => obj._id).indexOf(req.body.likeId);
                history.posts[post_idx].likes.splice(like_idx, 1);
                await history.save();
                success = true;

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                        let like_idx = publicPost[0].posts[i].likes.map(obj => obj._id).indexOf(req.body.likeId);
                        publicPost[0].posts[i].likes.splice(like_idx, 1);
                        numLikes = publicPost[0].posts[i].likes.length;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
 
    return res.json({
        status: success,
        numLikes: numLikes
    })
}

async function addComment(req, res){
    /**
     * Description: Adds a comment to an author's post to the database 
     * Returns: A boolean status if the comment is successfully saved into the database
     *          The number of comments the post has
     */
    console.log('Debug: Adding a comment')
    const postHistory = await PostHistory.findOne({authorId: req.body.authorId});
    let publicPost = await PublicPost.find();
    let success = false;

    var comment = new Comment({
        commenter: req.body.commenter,
        comment: req.body.content
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.postId);
    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        postHistory.posts[idx].count + 1;
        postHistory.save();
        success = true;

        for (let i = 0; i < publicPost[0].posts.length; i++) {
            if (publicPost[0].posts[i].post._id === req.body.postId) {
                publicPost[0].posts[i].post.count + 1;
                publicPost[0].posts[i].post.comments.push(comment);
                await publicPost[0].save();
            }
        }
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numComments: postHistory.posts[idx].count })
}

async function deleteComment(req, res){
    /**
     * Description: Removes a comment from an author's post in the database 
     * Returns: A boolean status if the comment is successfully removed from the database
     *          The number of comments the post has
     */
    console.log('Debug: Deleting a comment')
    let success = false;
    let numComments = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found comment')
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.commentId);
                history.posts[post_idx].comments.splice(com_idx, 1);
                history.posts[idx].count - 1;
                numComments = history.posts[idx].count;
                success = true;
                await history.save();

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                        let com_idx = publicPost[0].posts[i].comments.map(obj => obj._id).indexOf(req.body.commentId);
                        publicPost[0].posts[i].comments.splice(com_idx, 1);
                        publicPost[0].posts[i].count - 1;
                        numComments = publicPost[0].posts[i].count;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
    
    return res.json({
        status: success,
        numComments: numComments
    })
}

async function editComment(req, res){
    /**
     * Description: Edits a comment from an author's post in the database 
     * Returns: A boolean status if the comment is successfully edited to the database
     */
    console.log('Debug: Editing a comment')
    let success = false;
    await PostHistory.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found the comment')
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].comments[com_idx].comment = req.body.data.comment;
                history.save();
                success = true;
            }
        }
    }).clone()
    
    return res.json({ status: success })
}

async function createPost(req, res, postId){
    /**
     * Description: Creates an author's post in the database 
     * Returns: N/A
     */
    console.log('Debug: Creating a post')
    let authorId = req.params.author_id;
    //Setup the rest of the post
    const title = req.body.data.title;
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = [""];
    const published = new Date().toISOString();
    const visibility = req.body.data.visibility;
    const unlisted = req.body.data.unlisted;
    const specifics = req.body.data.specifics;
    const image = req.body.data.image;

    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts
    let post_history = await PostHistory.findOne({authorId: authorId});

    if (post_history == null) {
        console.log('Debug: Create a post history');
        await createPostHistory(authorId);
    }

    if(postId == undefined){

        var post = new Post({
            title: title,
            description: desc,
            contentType: contentType,
            content: content,
            authorId: authorId,
            categories: categories,
            count: 0,
            likes: [],
            comments: [],
            published: published,
            visibility: visibility,
            specifics: specifics,
            unlisted: unlisted,
            image: image
        });
    }
    else{
        var post = new Post({
            _id: postId,
            title: title,
            description: desc,
            contentType: contentType,
            content: content,
            authorId: authorId,
            categories: categories,
            count: 0,
            likes: [],
            comments: [],
            published: published,
            visibility: visibility,
            specifics: specifics,
            unlisted: unlisted,
            image: image
        });
    }

    post_history = await PostHistory.findOne({authorId: authorId});
    post_history.posts.push(post);
    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();

    if (visibility === 'Public') {
        let publicPost = await PublicPost.find();
        publicPost[0].posts.push({authorId: authorId, post: post});
        publicPost[0].num_posts = publicPost[0].num_posts + 1;
        await publicPost[0].save();
    }
}

async function getPost(req, res){
    /**
     * Description: Gets an author's post from the database 
     * Returns: Status 404 if the post is not found in the database
     *          The post from the database
     */
    console.log("Debug: Getting a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    let post = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {'posts._id' : postId}
        }
    ]);
    if(post.length == 0)
        return res.sendStatus(404);
    return res.json(post);
}

async function getPostsPaginated(req, res){
    /**
     * Description: Pages the posts form the database 
     * Returns: Status 200 if the posts are successfully retrieved and paginated from the database
     */
    console.log('Debug: Paging the posts')
    const authorId = req.params.author_id;

    console.log(req.query.page);
    console.log(req.query.size);

    let page = 1;
    let size = 5;
    if(req.query.page != undefined)
        page = req.query.page;
    if(req.query.size != undefined)
        size = req.query.size;

    const start_index = (page - 1) * size; 
    const end_index = page * size;

    let posts = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $project: {_id: 1, posts: {$slice: ["$posts", start_index, end_index]}}
        },
        {
            $unwind: "$posts"
        }
    ])
    
    return res.sendStatus(200);
}

async function updatePost(req, res){
    /**
     * Description: Updates an author's post in the database 
     * Returns: Status 200 if the author's post is successfully updated in the database
     */
    console.log("Debug: Update a post");

    const authorId = req.params.author_id;
    const postId = req.body.data.postId;

    const title = req.body.data.title;
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = req.body.data.categories;
    const visibility = req.body.data.visibility;
    const unlisted = req.body.data.listed;
    const specifics = req.body.data.specifics;
    const image = req.body.data.image;

    const post_history = await PostHistory.findOne({authorId: authorId});
    const publicPost = await PublicPost.find();

    let post = null;
    let postIdx = post_history.posts.map(obj => obj._id).indexOf(postId);
    if (postIdx > -1) { 
        post = post_history.posts[postIdx]
    }

    let specifics_updated = false;
    post.title = title; 
    post.description = desc;
    post.contentType = contentType;
    post.content = content;
    if ( post.visibility != visibility ) {
        if ( (visibility == 'Friends' || visibility == 'Public') && post.specifics.length != 0) {
            console.log('Debug: The user turned their private post to specific users to a public / friends viewable post.')
            post.specifics = [];
            specifics_updated = true;
        } else if (visibility == 'Public' && post.visibility != 'Public') {
            publicPost[0].posts.push({authorId: authorId, post: post});
            publicPost[0].num_posts = publicPost[0].num_posts + 1;
            await publicPost[0].save();
        } else if (post.visibility == 'Public' && visibility != 'Public') {
            let idx = publicPost[0].posts.map(obj => obj.post._id).indexOf(postId);
            if (idx > -1) { 
                publicPost[0].posts.splice(idx, 1);
                publicPost[0].num_posts = publicPost[0].num_posts - 1;
                await publicPost[0].save();
            }
        }
        post.visibility = visibility;
    }
    if ( !specifics_updated ) {
        if ( post.specifics != specifics ) {
            post.specifics = specifics;
        }
    }
    post.categories = categories;
    post.unlisted = unlisted;
    post.image = image;

    for (let i = 0; i < publicPost[0].posts.length; i++) {
        if (publicPost[0].posts[i].post._id === postId) {
            publicPost[0].posts[i].post = post;
            await publicPost[0].save();
        }
    }

    await post_history.save()
    console.log("Debug: Post has been updated and saved.");

    return res.sendStatus(200);
}

async function deletePost(req, res){
    /**
     * Description: Removes an author's post from the database 
     * Returns: Status 200 if the author's post is successfully removed from the database
     */
    console.log("Debug: Delete a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    const post_history = await PostHistory.findOne({authorId: authorId});

    if(post_history == undefined)
        return sendStatus(500);

    const post = post_history.posts.id(postId);
    if(post == null)
        return res.sendStatus(404);

    if (post.visibility == 'Public') {
        const publicPost = await PublicPost.find();
        let idx = publicPost[0].posts.map(obj => obj.post._id).indexOf(postId);
        if (idx > -1) { 
            publicPost[0].posts.splice(idx, 1);
            publicPost[0].num_posts = publicPost[0].num_posts - 1;
            await publicPost[0].save();
        }
    }

    post.remove();
    post_history.num_posts = post_history.num_posts - 1;
    post_history.save();

    return res.sendStatus(200);
}

async function checkVisibility(req, res){
    /**
     * Description: Checks the visibility level of the author's post for the viewer
     * Returns: Status 404 if the author's post is not found in the database
     *          Status 404 if the author's post visibility level is not viewable for the viewer
     *          The author's post if the visibility level is viewable for the viewer
     */
    console.log('Debug: Checks the visibility of the post for the viewer');
    const authorId = req.params.author_id;
    const viewerId = req.body.data.viewerId;
    const postId = req.params.post_id;

    let post = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {'posts._id' : postId}
        }
    ]);
    if(post.length == 0) { return res.sendStatus(404); }

    let viewable = false;
    if ( post.visibility == 'Public') {
        console.log('Debug: Everyone can see this post.')
        viewable = true;
    } else if ( post.visibility == 'Friends' ) {
        console.log('Debug: Only friends can see this post.')
        let friends = [];
        await Friend.findOne({authorId: authorId}, function(err, friend){
            console.log('Debug: Finding the friends list of post author.')
            if (friend) {
                friends = friend.friends;
            }
        }).clone()

        for ( let i = 0; i < friends.length ; i++ ) {
            if ( viewerId == friends[i].authorId ) {
                viewable = true;
                break;
            }
        }

        if ( !viewable ) {
            return res.sendStatus(404);
        } 
    } else if ( post.visibility == 'Private' ) {
        console.log('Debug: Only specific people can see this post (i.e., messages).')
        for ( let i = 0; i < post.specifics.length ; i++ ) {
            if ( viewerId == post.specifics[i].authorId ) {
                viewable = true;
                break;
            }
        }
        if ( !viewable ) {
            return res.sendStatus(404);
        }
    }

    return res.json({
        viewable: viewable
    })

}

async function fetchLikers(req, res) {
    /**
     * Description: Finds the authors that liked an author's post from the database 
     * Returns: Status 404 if the author's post is not found in the database
     *          The authors who liked the post
     */
    console.log('Debug: Getting the likers for a specific post.');

    const authorId = req.body.data.authorId;
    const postId = req.body.data.postId;

    const post = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {'posts._id' : postId}
        }
    ]);
    if(post.length == 0) { return res.sendStatus(404); }
    
    return post[0].posts.likes
}

async function hasLiked(req, res) {
    /**
     * Description: Shows the like status of the authors who liked a post from the database 
     * Returns: The status 'liked' if the author has liked the post
     *          The status 'unliked' if the author has unliked the post
     */
    const likers = await fetchLikers(req, res);
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({
                status: 'liked'
            })
        }
    }
    return res.json({
        status: 'unliked'
    })
}

/**
 * 
 * API STUFF
 */

async function apigetPost(authorId, postId){
    let post = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {'posts._id' : postId}
        }
    ]);
    if(post.length == 0) return 404;
    return post   
}

async function apiupdatePost(authorId, postId, newPost) {
    const title = newPost.title;
    const desc = newPost.desc;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const specifics = newPost.specifics;
    const image = newPost.image;

    const postHistory = await PostHistory.findOne({authorId: authorId});

    let post = null;
    let postIdx = postHistory.posts.map(obj => obj._id).indexOf(postId);
    if (postIdx > -1) { 
        post = postHistory.posts[postIdx]
    }

    let specifics_updated = false;
    post.title = title; 
    post.description = desc;
    post.contentType = contentType;
    post.content = content;
    if (post.visibility != visibility) {
        if ( (visibility == 'Friends' || visibility == 'Public') && post.specifics.length != 0) {
            console.log('Debug: The user turned their private post to specific users to a public / friends viewable post.')
            post.specifics = [];
            specifics_updated = true;
        } 
        post.visibility = visibility;
    }
    if (!specifics_updated) {
        if (post.specifics != specifics) { post.specifics = specifics; }
    }
    post.categories = categories;
    post.unlisted = unlisted;
    post.image = image;

    await postHistory.save()

    return 200;
}

async function apideletePost(authorId, postId) {
    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (postHistory == undefined) return sendStatus(500);

    const post = postHistory.posts.id(postId);

    if(post == null) return res.sendStatus(404);

    post.remove();
    postHistory.num_posts = postHistory.num_posts - 1;
    postHistory.save();

    return res.sendStatus(200); 
}

async function apicreatePost(authorId, postId, newPost, domain) {
    const title = newPost.title;
    const source = newPost.source;
    const desc = newPost.desc;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const specifics = newPost.specifics;
    const image = newPost.image;

    let postHistory = await PostHistory.findOne({authorId: authorId});

    if (postHistory == null) {
        console.log('Debug: Create a post history');
        await createPostHistory(authorId);
    }

    if(postId == undefined) {
        postId = uidgen.generateSync();
    }
    var post = new Post({
        _id: domain + "/authors/" + authorId + "/posts/" + postId,
        title: title,
        source: source,
        origiin, origin,
        description: desc,
        contentType: contentType,
        content: content,
        authorId: authorId,
        categories: categories,
        count: 0,
        likes: [],
        comments: [],
        published: published,
        visibility: visibility,
        specifics: specifics,
        unlisted: unlisted,
        image: image
    });

    postHistory = await PostHistory.findOne({authorId: authorId});
    postHistory.posts.push(post);
    postHistory.num_posts = postHistory.num_posts + 1;
    await postHistory.save();  
}

module.exports={
    createPostHistory,
    createPost,
    getPost,
    getPostsPaginated,
    updatePost,
    deletePost,
    addLike,
    addComment,
    deleteLike,
    deleteComment,
    editComment,
    checkVisibility,
    hasLiked,
    apigetPost,
    apiupdatePost,
    apideletePost,
    apicreatePost
}