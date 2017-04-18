var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//User Schema
var UserDetail = new Schema({
    username: String,
    password: String,
    type: String
}, {
    collection: 'userInfo'
});

//Create MongoDB models
var UserDetails = mongoose.model('userInfo', UserDetail);

//Create MongoDB models
var UserDetails = mongoose.model('userInfo', UserDetail);

module.exports = {
  UserDetails: UserDetails,
}
