importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDHyrO3YK0JI1wa6I1XQtcTh8asp2p992A",
  authDomain: "cheesydelight-80a43.firebaseapp.com",
  projectId: "cheesydelight-80a43",
  messagingSenderId: "433558050592",
  appId: "1:433558050592:web:169b277e2337931475e945"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "https://sturdyknight.github.io/logo.png"
  });
});
