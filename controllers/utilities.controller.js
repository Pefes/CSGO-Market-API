const express = require("express"),
    router = express.Router(),
    utilitiesService = require("../services/utilities.service");


router.get("/getAutocompleteOptions", async (req, res) => {
    const result = await utilitiesService.getAutocompleteOptions(req.query.property);
    res.json(result);
});


module.exports = router;