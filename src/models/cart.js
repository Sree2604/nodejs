const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    product : {
        type : String
    },
    userId : {
        type : String
    },
    quantity : {
        type : Number
    }
})

module.exports = mongoose.model('Cart',cartSchema);