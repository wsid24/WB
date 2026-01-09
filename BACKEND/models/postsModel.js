const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },  
    numberofLikes: {
        type: Number,
        default: 0
    }
},  {
    timestamps: true,
    collection: 'test'
});

postsSchema.statics.createPost = async function(title, content) {
    try {
        const post = await this.create({ title, content });
        return post;
    } catch (error) {
        throw 'Error creating post: ' + error;
    }
};

postsSchema.statics.getAllPosts = async function() {
    try {
        const posts = await this.find({}).sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        throw 'Error retrieving posts: ' + error;
    }
};

const postsModel = mongoose.model('Posts', postsSchema);

module.exports = postsModel;