const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    { SUCCESS, FAIL, GET_ITEM_FAIL } = require("../data/messages");

module.exports = {
    getMarketItems: async (limitParam) => {
        try {
            const limit = parseInt(limitParam ?? 0);
            const items = await db.Item.find().limit(limit);
    
            return getResponsePayload(SUCCESS, null, items);
        } catch {
            return getResponsePayload(FAIL, GET_ITEM_FAIL, null);
        }
    }
}