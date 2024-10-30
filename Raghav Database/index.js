const { faker } = require('@faker-js/faker');
const  mysql = require(`mysql2`);
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

app.set("viewengine","ejs");
app.set("views",path.join(__dirname,"/views"));
 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'posts',
    password: 'Rs@098123',
});

let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.username(), 
      faker.internet.email(),
      faker.internet.password(),
    ];
}

app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
})

app.get("/", (req,res)=>{
    let q = `select count(*) from user`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let count = (result[0]["count(*)"]);
            res.render("home.ejs" , {count});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
});

app.get("/user",(req,res)=>{
    let q = `SELECT * from user`;
    try{
        connection.query(q, (err,users)=>{
            if(err) throw err;
            res.render("showusers.ejs", {users});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }

});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.get("/user/:id/edit",(req,res) =>{
    let{id}=req.params;
    let q = `SELECT * from user where id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let user = result[0];
            res.render("edit.ejs",{user});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
});

app.patch("/user/:id",(req,res)=>{
    let{id}=req.params;
    let{password:formpass , username:newUsername} = req.body;
    let q = `SELECT * from user where id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let user = result[0];
            if(formpass != user.password){
                res.send("wrong password");
            }else{
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id ='${id}'`;
                connection.query(q2,(err,result)=>{
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
});

app.delete("/user/:id",(req,res)=>{
    let{id}=req.params;
    let{password:formpass ,email:formmail} = req.body;
    let q = `SELECT * from user where id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let user = result[0];
            if(formpass != user.password && formmail != user.email){
                res.send("wrong password");
            }else{
                let q2 = `DELETE from user WHERE email ='${formmail}'`;
                connection.query(q2,(err,result)=>{
                    if (err) throw err;
                    res.redirect("/user");
                }); 
            }
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }

});

app.post("/user/new",(req,res)=>{
    let {username,password,email} = req.body;
    let id = uuidv4();
    let q = `INSERT into user (id,username,password,email) VALUES ('${id}','${username}','${password}','${email}')`;
    try{
        connection.query(q, (err,users)=>{
            if(err) throw err;
            res.redirect("/user");
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }

});

app.listen("8080" ,()=>{
    console.log("app is listening");
});