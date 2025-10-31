const express=require("express");
const app=express();
const port=8080;
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.listen(port,()=>{
    console.log(`app is listening port ${port}`);
})
app.get("/",(req,res)=>{
    res.render("home.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.get("/signUp",(req,res)=>{
    res.render("signUp.ejs");
})
app.get("/dashboard",(req,res)=>{
    res.render("dashboard.ejs");
})
app.get("/leaderboard",(req,res)=>{
    res.render("leaderboard.ejs");
})