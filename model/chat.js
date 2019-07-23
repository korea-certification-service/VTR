const mongoose = require('mongoose');

// Define Schemes
const chatSchema = new mongoose.Schema({
  roomToken: { type: String, required: true },
  who: { type: String, required: true },
  to: { type: String},
  msg: { type: String, required: true },
  msgtime: { type: String, required: true },
  sameUser: { type: String, default: false },
  room: {type: String, }
});

// Create new todo document
chatSchema.statics.create = function (payload) {
  // this === Model
  const todo = new this(payload);
  // return Promise
  return todo.save();
};

// Find All
chatSchema.statics.findAll = function () {
  // return promise
  // V4부터 exec() 필요없음
  return this.find({});
};

// Update는 다시 생각해보기
chatSchema.statics.updateByTodoid = function (todoid, payload) {
  // { new: true }: return the modified document rather than the original. defaults to false
  return this.findOneAndUpdate({ todoid }, payload, { new: true });
};

// Create Model & Export
module.exports = mongoose.model('Chat', chatSchema);