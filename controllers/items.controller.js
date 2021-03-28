const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service"),
    itemsService = require("../services/items.service");


router.get("/getMarketItems", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.getMarketItems(req.query.limit);
    res.json(result);
});


module.exports = router;