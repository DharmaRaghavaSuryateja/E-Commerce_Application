const express = require("express");
const Item = require("../models/item");
const Auth = require("../middleware/auth");
const Cart = require("../models/cart");

const router = new express.Router();

//fetch all items
router.get("/items/:token", Auth, async (req, res) => {
  try {
    const items = await Item.find({});
    res.render("items", { items, token: req.token, user: req.user });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/buyeritems/:token", Auth, async (req, res) => {
  try {
    const items = await Item.find({});
    try {
      var cart = await Cart.find({ owner: req.user._id });
      console.log(cart);
      var cartquantity = 0;
      for (let i = 0; i < cart[0].items.length; i++) {
        cartquantity += cart[0].items[i].quantity;
      }
    } catch (err) {}
    res.render("buyeritems", {
      items,
      token: req.token,
      user: req.user,
      abc: cart,
      cartquantity
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// //fetch an item
// router.get("/items/:id", async (req, res) => {
//   try {
//     const item = await Item.findOne({ _id: req.params.id });
//     if (!item) {
//       res.status(404).send({ error: "Item not found" });
//     }
//     res.status(200).send(item);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

//create an item
router.post("/itemspost/:token", Auth, async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      owner: req.user._id,
    });
    console.log(newItem);
    await newItem.save();
    res.redirect(`/items/${req.params.token}`);
  } catch (error) {
    console.log({ error });
    res.status(400).send({ message: "error" });
  }
});

router.get("/itemspost/:token", (req, res) => {
  res.render("itemspost", { token: req.params.token });
});

//update an item

router.post("/updateitems/:token&:id", Auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description", "category", "price"];
  try {
    console.log("ll");
    var xyz = await Cart.find({});
    for (let i = 0; i < xyz.length; i++) {
      for (let j = 0; j < xyz[i].items.length; j++) {
        if (xyz[i].items[j].itemId == req.params.id) {
          fun(xyz[i], req.body.name, req.body.price, j,xyz[i].items[j].price);
        }
      }
    }
    async function fun(carte, name, price,j,oldprice) {
      carte.items[j].name=name
      carte.items[j].price=price
      carte.bill =
        carte.bill -
        oldprice * carte.items[j].quantity +
        price * carte.items[j].quantity;
      carte.save();
     

      console.log(name);
    }
  } catch (err) {}
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    const item = await Item.findOne({ _id: req.params.id });

    if (!item) {
      return res.status(404).send();
    }

    updates.forEach((update) => (item[update] = req.body[update]));
    await item.save();
    res.redirect(`/items/${req.params.token}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/updateitems/:token&:id", Auth, async (req, res) => {
  const user = await Item.findById(req.params.id);
  console.log(user);
  res.render("update", {
    token: req.params.token,
    id: req.params.id,
    items: user,
  });
});

//delete item
router.post("/deleteitems/:token&:id", Auth, async (req, res) => {
  try {
    const deletedItem = await Item.findOneAndDelete({ _id: req.params.id });

    try {
      console.log("ll");
      var xyz = await Cart.find({});
      for (let i = 0; i < xyz.length; i++) {
        for (let j = 0; j < xyz[i].items.length; j++) {
          if (xyz[i].items[j].itemId == req.params.id) {
            fun(
              xyz[i].items[j].quantity,
              xyz[i].items[j].price,
              xyz[i].bill,
              xyz[i]._id
            );
          }
        }
      }
      async function fun(quan, price, bill, id) {
        let res = bill - quan * price;
        await Cart.updateOne({ _id: id }, { bill: res });
      }
      await Cart.updateMany(
        {},
        {
          $pull: {
            items: { itemId: req.params.id },
          },
        }
      );
    } catch (err) {}
    if (!deletedItem) {
      res.status(404).send({ error: "Item not found" });
    }
    console.log("LLLLLL");
    res.redirect(`/items/${req.params.token}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
