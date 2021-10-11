const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service"),
    itemsService = require("../services/items.service");


router.get("/getItemImage", (req, res) => {
    itemsService.getItemImage(res, req.query.imageUrl);
});

router.post("/getMarketItems", async (req, res) => {
    const result = await itemsService.getMarketItems(req.body);
    res.json(result);
});

router.post("/getOwnedItems", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.getOwnedItems(req.user, req.body);
    res.json(result);
});

router.post("/buyItem", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.buyItem(req.user, req.body.itemId);
    res.json(result);
});

router.post("/sellItem", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.sellItem(req.user, req.body.itemId);
    res.json(result);
});

router.post("/openContainer", authService.authenticateToken, async (req, res) => {
    const result = await itemsService.openContainer(req.user, req.body.containerId);
    res.json(result);
});

module.exports = router;