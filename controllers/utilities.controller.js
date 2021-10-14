const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service"),
    utilitiesService = require("../services/utilities.service");


router.get("/getAutocompleteOptions", async (req, res) => {
    const result = await utilitiesService.getAutocompleteOptions(req.query.property);
    res.json(result);
});

router.post("/setUserDarkThemeOption", authService.authenticateToken, async (req, res) => {
    const result = await utilitiesService.setUserDarkThemeOption(req.user, req.body.darkTheme);
    res.json(result);
});


module.exports = router;