const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AutoShareSchema = new Schema({
  data: Object,
  _id: String,
  dbname: String
});

module.exports = mongoose.model("AutoShare", AutoShareSchema);