// ========================================
// E-Commerce Frontend — Firebase Config
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyDt3sSVWjJ6ZTveCZ2gYNmsqrQzkstP34Y",
    authDomain: "eshop-ecommerce-1daf9.firebaseapp.com",
    projectId: "eshop-ecommerce-1daf9",
    storageBucket: "eshop-ecommerce-1daf9.firebasestorage.app",
    messagingSenderId: "168838608209",
    appId: "1:168838608209:web:0a2d7caf7404b9e0ca4f70",
    measurementId: "G-YGRV7ES46R"
};

// Initialize Firebase
if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase Initialized");
}
