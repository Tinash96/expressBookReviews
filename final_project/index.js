const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session setup
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Updated auth middleware — supports both session and Bearer token
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check for token in session or Authorization header
    const token = req.session?.authorization?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    jwt.verify(token, "access", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // Store user info in session
        req.session = {
            authorization: {
                accessToken: token,
                username: decoded.username
            }
        };
        next();
    });
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Server
const PORT = 6000;
app.listen(PORT, () => console.log("Server is running"));
