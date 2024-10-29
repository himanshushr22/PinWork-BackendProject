var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

router.get('/profile', isLoggedIn ,async function(req, res, next) {
  const user =
   await userModel
   .findOne({username: req.session.passport.user})
   .populate("posts")
  res.render('profile', {user, nav: true});
});

router.get('/show/posts', isLoggedIn ,async function(req, res, next) {
  const user =
   await userModel
   .findOne({username: req.session.passport.user})
   .populate("posts")
  res.render('show', {user, nav: true});
});

router.get('/feed', isLoggedIn ,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate('user')

  res.render('feed', {user, posts, nav: true})
});

router.get('/add', isLoggedIn ,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add', {user, nav: false});
});

router.post('/createpost', isLoggedIn, upload.single("postImage"), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/register', async function(req, res, next) {
  const data = await userModel({
   username: req.body.username,
   email: req.body.email,
   contact: req.body.contact,
   name: req.body.fullname
  })

  userModel.register(data, req.body.password)
  .then(()=>{
    passport.authenticate("local")(req, res, ()=>{
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local",{
  failureRedirect: '/',
  successRedirect: '/profile',
}) ,function(req, res, next) {
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {return next(err);}
    res.redirect('/');
  });
})

router.get('/term', function(req, res, next) {
  res.render('term', {nav:true});
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}


module.exports = router;

//55
