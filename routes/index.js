/*Esta sera la ruta destinada al registro, inicio de sesion (login) y autenticacion de usuarios.
A su vez, tambien tendra la ruta destinada a la funcionalidad de restablecimiento de contraseñas*/
require('dotenv').config(); //Para el correo electronico de envio
const router=require('express').Router();
const path=require('path');
const users=require('../src/users.js');
const bcrypt=require('bcryptjs'); //Para le encriptacion de la contraseña de lusuario
const saltRounds=10;
const nodemailer=require('nodemailer'); //Para el restablecimiento de contraseñas
const randomstring=require('randomstring'); //Para la generacion aleatoria de contraseñas nuevas para el usuario

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/test-api.html'));
});

router.post('/signin', async (req, res) => {
  bcrypt.genSalt(saltRounds, async (err, salt) => {
    if (err) return res.json({message: 'Ha ocurrido un error al encriptar tu contraseña. Intentalo de nuevo'});
    bcrypt.hash(req.body.password, salt, async (err, hash) => {
      if (err) return res.json({message: 'Ha ocurrido un error al encriptar tu contraseña. Intentalo de nuevo'});
      try{
        await users.create({
          email: req.body.email,
          password: hash
        });
        res.json({message: 'The has registrado con exito! Ahora puedes iniciar sesion para empezar a usar nuestro servicio.'});
      } catch(error){
        res.send({message: 'Ha ocurrido un error. Intentelo de nuevo!'});
      }
    });
  }); 
});

//Sin passport, solo para testear el bcrypt
router.post('/login', async(req, res) => {
  try{
    const result=await users.findAll({
      where: {
      	email: req.body.email
      }
    });
    if (result.length===1){
      bcrypt.compare(req.body.password, result[0].password, (err, result) => {
        if (err) return res.json({message: 'Error al iniciar sesion'});
        if (result){
          res.json({message: 'OK'});
        } else{
          res.json({message: 'El email o contraseña son incorrectos'});
        }
      });
    } else{
      res.json({message: 'El email o contraseña son incorrectos'});
    }
  } catch(error){
    res.json({message: 'Error'});
  }
});

router.put('/forgotten-password', async (req, res) => {
  try{
    const result=await users.findAll({
      where: {
      	email: req.body.email
      }
    });
    if (result.length===1){
      /*Envio el correo con al usuario con una contraseña temporal. La contrseña sera una cadena de 8 caracteres aleatorios.
      La misma se encriptara y se actualizara en la base de datos. Luego el usuario tendra la opcion de cambiar su contraseña
      una vez inicie sesion con la contraseña generada*/
      let newPassword=randomstring.generate({
        length: 8
      });
      bcrypt.genSalt(saltRounds, async (err, salt) => {
        if (err) return res.json({message: 'error'});
        bcrypt.hash(newPassword, salt, async (err, hash) => {
          if (err) return res.json({message: 'error'});
          await users.update({password: hash}, {
          	where: {
          	  email: req.body.email
          	}
          });
          //Configuracion para usar outlook
          let transporter=nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            secureConnection: false,
            port: 587,
            tls: {
              cipher: 'SSLv3'
            },
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          });
          let mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Nueva contraseña',
            text: `Tu nueva contraseña es "${newPassword}" . Recuerda cambiarla una vez por otra de tu preferencia una vez inicies sesion`
          };
          transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log(err);
              res.json({message: 'Ha ocurrido un error. Intentalo de nuevo'});
            } else {
              res.json({message: 'Correo enviado'});
              console.log("Correo electronico enviado");
            }
          });
        });
      });

    } else{
      res.json({message: 'El correo no existe'});
    }
  } catch(err){
  	console.log(err);
    res.json({message: 'Error'});
  }
});

router.put('/restore-password', async (req, res) => {
  try{
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      if (err) return res.json({message: 'Ha ocurrido un error al encriptar tu contraseña. Intentalo de nuevo'});
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        if (err) return res.json({message: 'Ha ocurrido un error al encriptar tu contraseña. Intentalo de nuevo'});
        try{
          let result=await users.update({password: hash}, {
            where: {
              email: req.body.email
            }
          });
          //el resultado de esa consula es [1] si fue exitosa (el correo existe), [0] en caso contrario
          console.log(result);
          if (result[0]){
            res.json({message: 'Tu contraseña ha sido cambiada!'});
          } else{
          	res.json({message: 'El correo electronico no existe'});
          }
          
        } catch(error){
          res.send({message: 'Ha ocurrido un error. Intentelo de nuevo!'});
        }
      });
    });
  } catch(err){
  	console.log(err);
  	res.json({message: 'Error'});
  }
});

module.exports=router;