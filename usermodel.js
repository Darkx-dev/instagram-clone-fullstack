const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/testDb')

const userSchema = mongoose.Schema({
    username: String,
    password: String
})

module.exports = mongoose.model("user", userSchema)

