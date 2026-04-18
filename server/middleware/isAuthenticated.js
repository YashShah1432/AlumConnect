const isAuthenticated = (req, res, next) => {
    console.log("SESSION:", req.session);
    console.log("USER:", req.user);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
    }

    next();
};

module.exports = { isAuthenticated };