var express = require('express');
var router = express.Router();


/* import mongoose and all needed Models */
var mongoose = require('mongoose');
var Thread = require('../models/Thread.js');
var Category = require('../models/Category.js');


/* routes for thread */

// get a specific thread by id
router.get('/:id', function(req, res, next){
	Thread.findById(req.params.id)
		.populate({
			path: 'posts',
			match: { deletedAt: null },
			select: 'body _id'
		})
		.populate({
			path: 'parent',
			select: 'title _id'
		})
		.exec(function(err, thread){
			if(err) return next(err);
			res.header("Content-Type", "application/json; charset=utf-8");
			res.json(thread);
		});
});

// create a thread
router.post('/', function(req, res, next) {
	Thread.create(req.body, function (err, thread) {
		if (err) return next(err);

		// register the thread at the parent category
		Category.findByIdAndUpdate(thread.parent, { $push : { threads: thread}}, function(err, next){
			if(err) return next(err);
		});

		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

// update thread by id
router.put('/:id', function(req, res, next) {
	Thread.findByIdAndUpdate(req.params.id, req.body, function (err, thread) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

// soft delete by setting actual date for deletedAt
router.delete('/:id', function(req, res, next) {
	Category.findByIdAndUpdate(req.params.id, {deletedAt: Date.now()} , function (err, category) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(category);
	});
});

// ONLY FOR DEBUG AND DEVELOPMENT: get all threads
router.get('/debug/getall', function(req, res, next) {
	Thread.find(function (err, thread) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

// ONLY FOR DEBUG AND DEVELOPMENT: delete a thread by id */
router.delete('/debug/delete/:id', function(req, res, next) {
	Thread.findByIdAndRemove(req.params.id, req.body, function (err, thread) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

module.exports = router;