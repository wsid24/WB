const PostsModel = require('../models/postsModel');

// Controller function to create a new post
const createPost = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newPost = await PostsModel.createPost(title, content);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post: ' + error });
    }
};

// Controller function to get all posts             
const getAllPosts = async (req, res) => {       
    try {
        const posts = await PostsModel.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts: ' + error });
    }
};

module.exports = {
    createPost,
    getAllPosts
};  