const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    MS = require("../data/messages"),
    got = require("got"),
    fs = require("fs"),
    { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } = require("../data/constants");


const getFindItemsQuery = (filtersData) => {
    const itemName = filtersData.name ?? "";
    const itemType = filtersData.type ?? "";
    const itemRarity = filtersData.rarity ?? "";
    const itemExterior = filtersData.exterior ?? "";
    const regExpOptions = "i";

    return {
        name: { $exists: true, $regex: new RegExp(itemName, regExpOptions) },
        type: { $exists: true, $regex: new RegExp(itemType, regExpOptions) },
        $or: [
            { exterior: { $regex: new RegExp(itemExterior, regExpOptions) } },
            { exterior: { $exists: false } }
        ],
        $or: [
            { rarity: { $regex: new RegExp(itemRarity, regExpOptions) } },
            { rarity: { $exists: false } }
        ]
    };
};

const drawItem = (contentItems) => {
    const drawnItem = contentItems[Math.floor(Math.random() * contentItems.length)];
    return {
        name: drawnItem.name,
        iconUrl: drawnItem.iconUrl,
        price: Math.floor(Math.random() * (1000 - 50 + 1) + 50),
        exterior: "Factory New",
        rarity: drawnItem.rarity,
        rarityColor: drawnItem.rarityColor,
        purchasable: false,
        type: "Weapon",
        weaponType: "Rifle",
        gunType: "AK-47"
    };
}

const getNoImage = () => {
    return fs.readFileSync("./data/images/no-image.png")
}
    
module.exports = {
    getItemImage: async (imageId) => {
        try {
            if (imageId && process.env.STEAM_CDN) {
                const imageUrl = process.env.STEAM_CDN + imageId;
                const response = await got(imageUrl).buffer();
                return response;
            } else {
                console.log(error);
                return await getNoImage();
            }
        } catch (error) {
            console.log(error)
            return await getNoImage();
        }
    },
    getMarketItems: async ({ filtersData, paginatorData }) => {
        try {
            const pageSize = parseInt(paginatorData.pageSize ?? DEFAULT_PAGE_SIZE);
            const pageNumber = parseInt(paginatorData.pageNumber ?? DEFAULT_PAGE_NUMBER);
            const sorting = filtersData.sorting ?? {};
            const query = { 
                ...getFindItemsQuery(filtersData),
                purchasable: true
            };

            const items = await db.Item.find(query)
                .sort(sorting)
                .skip(pageNumber * pageSize)
                .limit(pageSize);

            const itemsQuerySize = await db.Item.find(query).countDocuments();
    
            return getResponsePayload(MS.SUCCESS, null, { items, querySize: itemsQuerySize });
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.GET_ITEMS_FAIL, null);
        }
    },
    getOwnedItems: async (loggedInUserData, { filtersData, paginatorData }) => {
        try {
            const user = await db.User.findById(loggedInUserData._id);
            const pageSize = parseInt(paginatorData.pageSize ?? DEFAULT_PAGE_SIZE);
            const pageNumber = parseInt(paginatorData.pageNumber ?? DEFAULT_PAGE_NUMBER);
            const sorting = filtersData.sorting ?? {};
            const query = {
                ...getFindItemsQuery(filtersData),
                _id: { $in: user.ownedItems },
                purchasable: false
            };

            const ownedItems = await db.Item.find(query)
                .sort(sorting)
                .skip(pageNumber * pageSize)
                .limit(pageSize);

            const itemsQuerySize = await db.Item.find(query).countDocuments();
            
            return getResponsePayload(MS.SUCCESS, null, { items: ownedItems, querySize: itemsQuerySize });
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.GET_OWNED_ITEMS_FAIL, null);
        }
    },
    buyItem: async (loggedInUserData, itemId) => {
        try {
            const item = await db.Item.findById(itemId);

            if (item.purchasable) {
                const user = await db.User.findById(loggedInUserData._id);

                if (user.cash >= item.price) {
                    user.ownedItems.push(item._id);
                    user.cash -= item.price;
                    item.purchasable = false;
                    user.save();
                    item.save();
    
                    return getResponsePayload(MS.SUCCESS, null, null);
                } else {
                    return getResponsePayload(MS.FAIL, MS.BUY_ITEM_NOT_ENOUGH_MONEY, null);
                }
            }

            return getResponsePayload(MS.FAIL, MS.BUY_ITEM_NOT_PURCHASABLE, null);
        } catch (error) {
            console.log(error);
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
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.SELL_ITEM_FAIL, null);
        }
    },
    openContainer: async (loggedInUserData, containerId) => {
        try {
            const container = await db.Item.findById(containerId);
            const user = await db.User.findById(loggedInUserData._id);

            if (user.ownedItems.includes(containerId) && container.openable) {
                const drawnItem = drawItem(container.content);
                const createdItem = await db.Item.create(drawnItem);
                user.ownedItems.push(createdItem._id);
                user.save();
                container.delete();

                return getResponsePayload(MS.SUCCESS, null, { drawnItem: createdItem });
            }

            return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
        }
    }
}