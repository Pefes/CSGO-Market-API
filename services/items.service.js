const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    { SUCCESS, FAIL, GET_ITEMS_FAIL, GET_OWNED_ITEMS_FAIL, BUY_ITEM_FAIL, BUY_ITEM_NOT_PURCHASABLE } = require("../data/messages");

    
module.exports = {
    getMarketItems: async (limitParam) => {
        try {
            const limit = parseInt(limitParam ?? 0);
            const items = await db.Item.find({ purchasable: true }).limit(limit);
    
            return getResponsePayload(SUCCESS, null, items);
        } catch {
            return getResponsePayload(FAIL, GET_ITEMS_FAIL, null);
        }
    },
    getOwnedItems: async (loggedInUserData, limitParam) => {
        try {
            const limit = parseInt(limitParam ?? 0);
            const user = await db.User.findById(loggedInUserData._id);
            const ownedItems = await db.Item.find().where("_id").in(user.ownedItems).limit(limit).exec();
            
            return getResponsePayload(SUCCESS, null, ownedItems);
        } catch {
            return getResponsePayload(FAIL, GET_OWNED_ITEMS_FAIL, null);
        }
    },
    buyItem: async (loggedInUserData, itemId) => {
        try {
            const item = await db.Item.findById(itemId);

            if (item.purchasable) {
                const user = await db.User.findById(loggedInUserData._id);
                user.ownedItems.push(item._id);
                item.purchasable = false;
                user.save();
                item.save();

                return getResponsePayload(SUCCESS, null, null);
            } else {
                return getResponsePayload(FAIL, BUY_ITEM_NOT_PURCHASABLE, null);
            }
        } catch {
            return getResponsePayload(FAIL, BUY_ITEM_FAIL, null);
        }
    }
}