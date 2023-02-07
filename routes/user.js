const express = require("express");
const User = require("../models/user");
const Auth = require("../middleware/auth");
const { name } = require("ejs");

const router = new express.Router();

//signup
router.post("/users", async (req, res) => {
    console.log(req.body)
   const {name,email,password}=req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    const token = await user.generateAuthToken();
  res.redirect(`/home/${token}`);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/users",(req,res)=>
{
    res.render("register");
})
//home
router.get("/home/:token",Auth,async (req,res)=>{
  let p=await User.findOne({_id:req.user._id})

  res.render("Home",{token:req.params.token,userr:p.name})
})
//login

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if(!user)
    { 
        var x="No Details Found"
        return res.render("login",{x})
    }
    else{
    const token = await user.generateAuthToken();
   res.redirect(`/home/${token}`);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/users/login",(req,res)=>
{

res.render("login")
})

//logout
router.get("/users/logout/:token", Auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    console.log(req.user)

    await req.user.save();
    res.redirect("/users/login")
  } catch (error) {
    res.status(500).send();
  }
});

//Logout All
router.post("/users/logoutAll", Auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});
module.exports = router;
