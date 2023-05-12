const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/**/
const admin = require('firebase-admin');

const db = admin.firestore();



module.exports.loginAdmin = async function (req, res) {
    const secretKey = 'je8ndeo2ne2ije2';
    const username = req.body.username;
    const password = req.body.password;
  
  
    try {
      const snapshot = await db.collection('users').where('name', '==', username).get();
      if (snapshot.empty) {
        res.send(JSON.stringify({ "status": 400, "error": "Invalid username or password", "response": null }));
      } else {
        const user = snapshot.docs[0].data();
        if (user.admin !== true) {
          res.send(JSON.stringify({ "status": 400, "error": "You are not an Admin", "response": null }));
          return;
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.log(err);
            res.send(JSON.stringify({ "status": 500, "error": "Internal Server Error", "response": null }));
          } else if (isMatch) {
            const payload = { username };
            const options = { expiresIn: '1200 seconds' };
            const token = jwt.sign(payload, secretKey, options);
            res.send(JSON.stringify({ "status": 200, "error": null, "response": user, "token": token }));
          } else {
            res.send(JSON.stringify({ "status": 400, "error": "Invalid username or password", "response": null }));
          }
        });
      }
    } catch (error) {
      console.error(error);
      res.send(JSON.stringify({ "status": 500, "error": "Internal Server Error", "response": null }));
    }
};



module.exports.selectModoAdmin = async function (req, res) {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();
      const users = [];
      snapshot.forEach(doc => {
        const user = doc.data();
        user.id = doc.id; 
        users.push(user);
      });
  
      await res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
  
module.exports.deleteModoAdmin = async function (req, res) {
    try {
      const userEmail = req.body.userEmail;
      const snapshot = await db.collection('users').where('email', '==', userEmail).get();
      const user = snapshot.docs[0].data();
      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }
      if (user.admin === true) {
          return res.status(400).json({ message: "No se puede eliminar a un usuario de tipo Administrador" });
        }
      const querySnapshot = await db.collection('users').where('email', '==', userEmail).get();
      if (querySnapshot.empty) {
        return res.status(404).json({ message: "User not found." });
      }
      const userDoc = querySnapshot.docs[0];
      await userDoc.ref.delete();
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
}
  
module.exports.actualizarUsuario = async function(req, res) {
    const { id, name, email } = req.body; 
    const userRef = db.collection('users').doc(id);
    
    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await userRef.update({ name, email }); 
  
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
}
  