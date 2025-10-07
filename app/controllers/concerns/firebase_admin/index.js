const firebase = require('firebase-admin');

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: Config.firebase.projectId,
      clientEmail: Config.firebase.clientEmail,
      privateKey: Config.firebase.privateKey,
    }),
    databaseURL: `https://${Config.firebase.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app/`
  });
}

module.exports = firebase;
