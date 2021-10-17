const express = require("express"),
    router = express.Router(),
    authService = require("../services/auth.service"),
    itemsService = require("../services/items.service");


router.get("/getItemImage", async (req, res) => {
    const result = await itemsService.getItemImage(req.query.imageUrl);
    res.setHeader("Content-Type", "image/png");
    res.send(result);
});

router.get("/getTryOutItems", async (req, res) => {
    const result = await itemsService.getTryOutItems();
    res.json(result);
});

router.get("/getLastOpenedItems", async (req, res) => {
    const result = await itemsService.getLastOpenedItems();
    res.json(result);
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

router.post("/openTryOutContainer", async (req, res) => {
    const result = await itemsService.openTryOutContainer(req.body.containerId);
    res.json(result);
});

module.exports = router;