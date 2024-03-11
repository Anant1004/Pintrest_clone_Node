const express = require('express');
const app = express();
const PORT = 8000;
const path = require('path');
const userModel = require('./models/users');
const postModel = require('./models/posts');
const expresSession  = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const localStrategy = require('passport-local');
const upload = require('./routes/multer') 

passport.use(new localStrategy(userModel.authenticate()));


app.use(flash());
app.use(expresSession({
    resave : false,
    saveUninitialized : false,
    secret : "Shhh this is a secret"
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.set('/views', path.resolve('views'));
app.set('view engine','ejs');


app.get("/",(req , res)=>{
    res.render("homepage");
});
app.get('/register',(req, res)=>{
    res.render('index');
})
app.get('/login',(req,res)=>{
    res.render('login', {error : req.flash('error')});
})
app.get('/profile',isloggedIn ,async (req, res) =>{
    const user = await userModel.findOne({
        username : req.session.passport.user
    })
    .populate('posts')
    res.render('profile', {user});
});
app.get('/feed', isloggedIn,async (req, res)=>{
    const user = await userModel.findOne({username : req.session.passport.user});
    const posts = await postModel.find().populate("user");
    res.render('feed',{user, posts});
});

app.post('/upload', isloggedIn ,upload.single('file'),async (req, res)=>{
    if(!req.file){
        return res.status(404).send('No files uploaded');
    }
    const user = await userModel.findOne({username : req.session.passport.user});
    const post = await postModel.create({
        image : req.file.filename,
        imageText :  req.body.fileCaption,
        user : user._id
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

app.post('/fileupload', isloggedIn ,upload.single('image'),async (req, res)=>{
    const user = await userModel.findOne({username : req.session.passport.user});
    user.dp = req.file.filename;
    await user.save();
    res.redirect('/profile')
});


app.post("/register", async (req , res)=>{
    const {username, email, fullname } = req.body;
    const userData = new userModel({ username, email, fullname });
    userModel.register(userData, req.body.password).then(function(){
        passport.authenticate('local')(req, res , function(){
            res.redirect('/profile');
        })
    })
});
app.post("/login",passport.authenticate('local',{
    successRedirect : '/profile',
    failureRedirect :  '/login',
    failureFlash: true
}), (req , res)=>{});

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

function isloggedIn (req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login');
}

// app.get('/alluserposts', async (req, res) =>{
//     const user = await userModel.findOne({_id : "65ea033e3cad3568af0bd4e6" }).populate('posts');
//     res.send(user);
// });


app.listen(PORT,console.log(` server listening on ${PORT}`));