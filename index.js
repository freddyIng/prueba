const express=require('express');
const app=express();
const port=5000; 
const path=require('path');
const session=require('express-session');
const passport=require('passport');
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const index=require(path.join(__dirname, '/routes/index.js'));
const user=require(path.join(__dirname, '/routes/user.js'));

app.use(index);
app.use(user);

app.listen(port, () => {  
  console.log('Servidor iniciado!');
});