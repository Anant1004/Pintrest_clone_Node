const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')
mongoose.connect('mongodb://localhost:27017/pintrestDb')
.then(console.log('Db connected'));

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required : true,
    },
    password: {
        type: String,
    },
    posts: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
    dp: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required : true,
    },
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
