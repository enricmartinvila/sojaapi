//const db = require('../database/db')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
/**/
const admin = require('firebase-admin');
const serviceAccount = require('../database/soja-6dcdd-firebase-adminsdk-k3qt5-27ea74ae7a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


/***/


const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'sojacons@outlook.es',
    pass: 'Mamisconshorts21'
  }
});

/**/

module.exports.nodemailerthing = async function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;
  const motivo = req.body.motivo;


  const mailOptions = {
      from: 'sojaConS@outlook.es',
      to: 'sojaConS@outlook.es',
      subject: 'Formulario de contacto de SOJA',
      text: 
      `
      Nombre: ${name}
      Email: ${email}
      Motivo: ${motivo} 
      Message: ${message}
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send({ message: 'Error al enviar el correo electrónico' });
      } else {
        guardarEnSql(email, motivo);
        res.status(200).send({ message: 'Correo electrónico enviado con éxito' });
      }
    });
};


/**/ 


module.exports.crearRegistro = async function (req, res) {
  try {
      let name = req.body.name;
      let email = req.body.email;
      let password = req.body.password;
      let admin = req.body.admin;
      if (admin == undefined) {
        admin = false;
      }
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (!snapshot == undefined) {
        res.send(JSON.stringify({"status": 400, "error": "El email ya está en uso", "response": null}));
        return;
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        password = hash;
        const data = { name, email, password, admin };
        const result = await db.collection('users').add(data);
        res.send(JSON.stringify({"status": 200, "error": null, "response": result}));        
      }
  } catch (error) {
      console.error(error);
      res.send(JSON.stringify({"status": 500, "error": "Error interno del servidor", "response": null}));
  }
};




module.exports.loginWT = async function (req, res) {
  const secretKey = 'je8ndeo2ne2ije2';
  const email = req.body.email;
  const password = req.body.password;
  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      res.send(JSON.stringify({ "status": 400, "error": "Invalid email or password", "response": null }));
    } else {
      const user = snapshot.docs[0].data();
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({ "status": 500, "error": "Internal Server Error", "response": null }));
        } else if (isMatch) {
          const payload = { email };
          const options = { expiresIn: '1200 seconds' };
          const token = jwt.sign(payload, secretKey, options);
          res.send(JSON.stringify({ "status": 200, "error": null, "response": user, "token": token }));
        } else {
          res.send(JSON.stringify({ "status": 400, "error": "Invalid email or password", "response": null }));
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.send(JSON.stringify({ "status": 500, "error": "Internal Server Error", "response": null }));
  }
};




module.exports.tokenRecuperacionPasswd = async function (req, res) {
  const email = req.body.email;
  const secretKey = 'je8ndeo2ne2ije2';
  const payload = { email };
  const options = { expiresIn: '600 seconds' };
  const token = jwt.sign(payload, secretKey, options);
  res.json({ token });
}



module.exports.tokenAcceso= async function (req, res) {
    res.json({ message: 'Accesopermitido' });
}

module.exports.nodemailerNewPassword = async function (req, res) {
  let token = req.body.token;
  let email = req.body.email;
  try {
    let userRef = admin.firestore().collection('users').where('email', '==', email);
    let userSnapshot = await userRef.get();
    if (!userSnapshot.empty) {
      let mailOptions = {
        from: 'sojacons@outlook.es',
        to: email,
        subject: 'Recuperación de contraseña',
        text: 'Haga clic en este enlace para restablecer su contraseña: http://127.0.0.1:5500/src/CLIENTE/RecuperPasswd/index.html?tk=' + token
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
        }
        res.status(200).json({ message: 'Correo electrónico enviado' });
      });
    } else {
      return res.status(200).json({ message: 'El correo electrónico proporcionado no coincide con ningún usuario' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports.updateBBDDNewPassword = async function (req, res) {
  const newPassword = req.body.newPassword;
  const email = req.body.email;
  try {
    const userRef = db.collection('users').where('email', '==', email);
    const userSnapshot = await userRef.get();
    
    if (userSnapshot.empty) {
      console.log('No such document!');
      return res.status(404).json({ message: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    const hash = await bcrypt.hash(newPassword, 10);
    await db.collection('users').doc(userId).update({ password: hash });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

