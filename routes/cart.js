const express = require("express");
const mongodb = require("mongodb");
const Cart = require("../models/cart");
const Item = require("../models/item");
const Order = require("../models/Order");
const Auth = require("../middleware/auth");

const router = new express.Router();

//get cart items

router.get("/cart/:token", Auth, async (req, res) => {
  const owner = req.user._id;

  try {
    const cart = await Cart.findOne({ owner });

    res.render("cart", { cart, token: req.token });
  } catch (error) {
    res.status(500).send();
  }
});

//add cart
router.post("/cart/:token", Auth, async (req, res) => {
  const owner = req.user._id;
  const itemId = req.body.id;
  const quantity = req.body.num;
  var q;
  var b;
  var resu;
  var p;
  if (quantity == 0) {
    console.log("kk");

    var xyz = await Cart.findOne({ owner });
    //if user is totally not threr in the cart db then it returns null
    if (xyz == null || xyz.items.length == 0) {
      return res.send("Add Something");
    }
    var state = 0;

    for (let i = 0; i < xyz.items.length; i++) {
      if (xyz.items[i].itemId == itemId) {
        console.log("arey")
        q = xyz.items[i].quantity;
        p = xyz.items[i].price;
        state = 1;
      }
    }
    console.log(state);
    if (state == 0) {
      console.log("tryy")
      return res.send("Add something");
    }
    b = xyz.bill;
    resu = b - q * p;
    console.log(resu);

    await Cart.findOneAndUpdate({ owner }, { bill: resu });

     await Cart.updateOne(
      { owner },
      {
        $pull: {
          items: { itemId: itemId },
        },
      }
    );
     return res.redirect(`/buyeritems/${req.params.token}`);
  }

  try {
    const cart = await Cart.findOne({ owner });
    const item = await Item.findOne({ _id: itemId });

    if (!item) {
      res.status(404).send({ message: "item not found" });
      return;
    }
    const price = item.price;
    const name = item.name;
    //If cart already exists for user,
    if (cart) {
      const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
      //check if product exists or not

      if (itemIndex > -1) {
        let product = cart.items[itemIndex];
        product.quantity = quantity;

        cart.bill = cart.items.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        cart.items[itemIndex] = product;
        await cart.save();
        res.redirect(`/buyeritems/${req.params.token}`);
      } else {
        cart.items.push({ itemId, name, quantity, price });
        cart.bill = cart.items.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        await cart.save();
        res.redirect(`/buyeritems/${req.params.token}`);
      }
    } else {
      //no cart exists, create one
      const newCart = await Cart.create({
        owner,
        items: [{ itemId, name, quantity, price }],
        bill: quantity * price,
      });
      return res.redirect(`/buyeritems/${req.params.token}`);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong");
  }
});
router.post("/order/:token", Auth, async (req, res) => {
  const token = req.token;
  const userid = req.user._id;
  const cart = await Cart.findOne({ owner: userid });
  const newOrder = new Order({
    owner: req.user._id,
    items: cart.items,
    bill: cart.bill,
  });
  await Cart.findOneAndDelete({ owner: userid });
  await newOrder.save();
  res.redirect(`/order/${token}`);
});

router.get("/order/:token", Auth, async (req, res) => {
  const orders = await Order.find();
  console.log(orders);
  res.render("orders", {
    orders: orders,
    id: req.user._id,
    token: req.params.token,
  });
});

module.exports = router;
