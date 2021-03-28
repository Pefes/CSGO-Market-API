const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service");


router.post("/register", async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.json(result);
});

router.post("/login", async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
});


module.exports = router;