/**
 * 채팅내용 DB 저장을 위한 모델
 * @author Jongmin Kim
 * @since 191121
 */
const mongoose = require('mongoose');
let Mixed = mongoose.Schema.Types.Mixed;
// Define Schemes
const chatSchema = new mongoose.Schema({
  //roomToken: { type: String, required: true },
  // who: { type: String, /*required: true*/ },
  // to: { type: String},
  // msg: { type: String, /*required: true*/ },
  // msgtime: { type: String, /*required: true*/ },
  // sameUser: { type: String, default: false },
  // room: {type: String, }
  room: { type: String, required: true },
  msgs: Mixed
});

// Create 
chatSchema.statics.create = function (obj) {
  // this === Model
  const chat = new this(obj);

  return chat.save();
};

// Create and Update
chatSchema.statics.createandUpdate = function (obj) {
  console.log("obj", obj.room, obj.msgs[0]);
  // this === Model

  return this.findOneAndUpdate(
    {room: obj.room}, // 원하는 값
    {$push: {msgs: obj.msgs[0]}},
    { upsert: true } 
  )

  //db.getCollection('chats').findOneAndUpdate({room: "tjdudwp02|testkcs|5d354b76969eb20ac8890f77"}, {$push: {msgs: {who: "testkcs", to: "tjdudwp02", msg: "asdfg", msgtime: "3:35 PM"}}})
};

// Select All
chatSchema.statics.findAll = function () {
  return this.find();
};

// Select where
chatSchema.statics.findOneByRoom = function (obj) {
  console.log("obj.room ", obj.room)
  return this.findOne({room: obj.room});
};

// Update는 다시 생각해보고 로직 짜기
chatSchema.statics.updateByTodoid = function (todoid, payload) {
  // { new: true }: return the modified document rather than the original. defaults to false
  return this.findOneAndUpdate({ todoid }, payload, { new: true });
};

// Create Model & Export
module.exports = mongoose.model('Chat', chatSchema);