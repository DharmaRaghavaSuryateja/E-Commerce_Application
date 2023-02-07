const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
 


// // getting a post in full page

// const div= document.getElementsByClassName( postid)
// div.addEventListener(onclick,()=>
// {
//   // const div=document.createElement
//   div.innerHTML="HI";

// })