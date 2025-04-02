const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        
        try {
            jwt.verify(token, "access", (err, user) => {
                if (!err) {
                    req.user = user;
                    next();
                } else {
                    return res.status(403).json({ message: "User not authenticated" });
                }
            });
        } catch (err) {
            return res.status(403).json({ message: "User not authenticated" });
        }
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

const server = app.listen(PORT, () => console.log("Server is running"));

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Received shutdown signal. Closing server...');
    server.close(() => {
        console.log('Server closed. Exiting process...');
        process.exit(0);
    });

    // If server hasn't finished in 10 seconds, force shutdown
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}
