/**
 * All needed routes to offer CRUD functionality
 * CRUD:
 * CREATE - post
 * READ - get
 * UPDATE - put
 * DELETE - put / delete
 */

// dependencies
var express = require('express');
var router = express.Router();
var permission = require('./lib/permission');


/* import mongoose and all needed Models */
var mongoose = require('mongoose');
var Thread = require('../models/Thread.js');
var Category = require('../models/Category.js');


/* routes for thread */

// get a specific thread by id
router.get('/:id', function(req, res, next){
	Thread.findById(req.params.id)
		.select('_id title parent createdBy updatedBy posts')
		.deepPopulate(
			'parent' +
			' createdBy' +
			' posts' +
			' posts.createdBy' +
			' posts.updatedBy'
		)
		.exec(function(err, thread){
			if(err) return next(err);
			res.header("Content-Type", "application/json; charset=utf-8");
			res.json(thread);
		});
});

// create a thread
router.post('/', function(req, res, next) {
	// add the user ID to the thread before creating it
	req.body.createdBy = req.user._id;

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
router.put('/:id', permission.check, function(req, res, next) {
	req.body.updatedBy = req.user._id;
	req.body.updatedAt = Date.now();
	Thread.findByIdAndUpdate(req.params.id, req.body, function (err, thread) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

// soft delete thread by setting current date for deletedAt
router.delete('/:id', permission.check, function(req, res, next) {
	delete_info = {
		deletedAt: Date.now(),
		updatedBy: req.user._id
	};

	Thread.findByIdAndUpdate(req.params.id, delete_info , function (err, thread) {
		if (err) return next(err);
		res.header("Content-Type", "application/json; charset=utf-8");
		res.json(thread);
	});
});

// ONLY FOR DEBUG AND DEVELOPMENT: get all threads
router.get('/debug/getall', function(req, res, next) {
	Thread.find()
		.deepPopulate(
			'posts.createdBy' +
			' parent.title' +
			' createdBy.userName'
		)
		.exec(function (err, thread) {
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
