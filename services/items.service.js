const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    MS = require("../data/messages"),
    { MAX_ITEMS_RESPONSE } = require("../data/constants");


const getFindItemsQuery = (queryParams) => {
    const itemName = queryParams.name ?? "";
    const itemType = queryParams.type ?? "";
    const itemExterior = queryParams.exterior ?? "";
    const regExpOptions = "i";

    return {
        name: { $exists: true, $regex: new RegExp(itemName, regExpOptions) },
        type: { $exists: true, $regex: new RegExp(itemType, regExpOptions) },
        $or: [
            { exterior: { $regex: new RegExp(itemExterior, regExpOptions) } },
            { exterior: { $exists: false } }
        ]
    };
};

    
module.exports = {
    getMarketItems: async (queryParams) => {
        try {
            const limit = parseInt(queryParams.limit ?? MAX_ITEMS_RESPONSE);
            const query = { 
                ...getFindItemsQuery(queryParams),
                purchasable: true
            };

            const items = await db.Item.find(query).limit(limit);
    
            return getResponsePayload(MS.SUCCESS, null, items);
        } catch {
            return getResponsePayload(MS.FAIL, MS.GET_ITEMS_FAIL, null);
        }
    },
    getOwnedItems: async (loggedInUserData, queryParams) => {
        try {
            const user = await db.User.findById(loggedInUserData._id);
            const limit = parseInt(queryParams.limit ?? MAX_ITEMS_RESPONSE);
            const query = {
                ...getFindItemsQuery(queryParams),
                _id: { $in: user.ownedItems },
                purchasable: false
            };

            const ownedItems = await db.Item.find(query).limit(limit);
            
            return getResponsePayload(MS.SUCCESS, null, ownedItems);
        } catch {
            return getResponsePayload(MS.FAIL, MS.GET_OWNED_ITEMS_FAIL, null);
        }
    },
    buyItem: async (loggedInUserData, itemId) => {
        try {
            const item = await db.Item.findById(itemId);

            if (item.purchasable) {
                const user = await db.User.findById(loggedInUserData._id);
                user.ownedItems.push(item._id);
                user.cash -= item.price;
                item.purchasable = false;
                user.save();
                item.save();

                return getResponsePayload(MS.SUCCESS, null, null);
            }

            return getResponsePayload(MS.FAIL, MS.BUY_ITEM_NOT_PURCHASABLE, null);
        } catch {
            return getResponsePayload(MS.FAIL, MS.BUY_ITEM_FAIL, null);
        }
    },
    sellItem: async (loggedInUserData, itemId) => {
        try {
            const item = await db.Item.findById(itemId);
            
            if (!item.purchasable) {
                const user = await db.User.findById(loggedInUserData._id);
                
                if (user.ownedItems.includes(itemId)) {
                    user.ownedItems = user.ownedItems.filter(item => item._id.toString() !== itemId);
                    user.cash += item.price;
                    item.purchasable = true;
                    user.save();
                    item.save();

                    return getResponsePayload(MS.SUCCESS, null, null);
                }
            }

            return getResponsePayload(MS.FAIL, MS.SELL_ITEM_NOT_OWNED, null);
        } catch {
            return getResponsePayload(MS.FAIL, MS.SELL_ITEM_FAIL, null);
        }
    }
}