var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ThreadSchema = new Schema({
	title: String,
	parent: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
	posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
	lastPost: {type: Schema.Types.ObjectId, ref: 'Post'},
	createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
	updatedAt: {type: Date, default: Date.now},
	deletedAt: {type: Date, default: null}
});

module.exports = mongoose.model('Thread', ThreadSchema);
