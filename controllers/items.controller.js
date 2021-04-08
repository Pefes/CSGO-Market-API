const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service"),
    itemsService = require("../services/items.service");


router.get("/getMarketItems", async (req, res) => {
    const result = await itemsService.getMarketItems(req.query.limit);
    res.json(result);
});

router.get("/getOwnedItems", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.getOwnedItems(req.user, req.query.limit);
    res.json(result);
});

router.post("/buyItem", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.buyItem(req.user, req.body.itemId);
    res.json(result);
});

module.exports = router;