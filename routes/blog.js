const express = require('express');
const res = require('express/lib/response');
const { get } = require('http');
const mongodb = require('mongodb');

const db = require('../data/database');
const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  //retrieved the posts data from database but only limited to title, summary, authorname
  const posts = await db.getDb()
    .collection('posts')
    .find({},{title: 1, summary: 1,'author.name': 1})
    .toArray();
  res.render('posts-list', {posts: posts});
});

router.get('/new-post', async function(req, res) {

  //retrieved the authors from MongoDb
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors});
});


router.post('/posts', async function(req,res){
  const authorId = new ObjectId(req.body.author);
  const author = await db.getDb().collection('authors').findOne({_id: authorId});

  //retrieve the body content of the post data in create-post.ejs and prepare as store in database
  const newPost = {  
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,  //id of the author (value)
      name: author.name, // name of the author
      email: author.email //email of the author
    }
  }; 
  //insert the data
  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result)
  res.redirect('/posts');
});

//GET Post route for individual view post
router.get('/posts/:id', async function(req,res,next){
  let postId = req.params.id;
  
  try {
    postId = new ObjectId(postId)
  } catch (error) {
     return res.status(404).render('404');
    // return next(error);
  }
  
  const post = await db.getDb().collection('posts').findOne( {_id: new ObjectId(postId)}, {summary:0});

  if(!post) {
    return res.status(404).render('404');
  }
  post.humanReadableDate = post.date.toLocaleDateString('en-US', {
    weekday:'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  post.date = post.date.toISOString();


  res.render('post-detail',{post:post})

})


router.get('/posts/:id/edit', async function(req,res){
  const postId = req.params.id;
  const post = await db.getDb().collection('posts').findOne( {_id: new ObjectId(postId)}, {title: 1 , summary:1 , body: 1});

  if(!post) {
    return res.status(404).render('404');
  }

  res.render('update-post', {post: post});
});

router.post('/posts/:id/edit', async function(req,res){
  const postId = new ObjectId(req.params.id);
  const result = await db.getDb().collection('posts').updateOne({_id: postId}, { $set: {
      title: req.body.title,
      summary: req.body.summary,
      body: req.body.content,
  }});

  res.redirect('/posts');
})


router.post('/posts/:id/delete', async function(req,res){
  const postId = new ObjectId(req.params.id);
  const result = await db.getDb().collection('posts').deleteOne({_id: postId});

  res.redirect('/posts');
})


module.exports = router;