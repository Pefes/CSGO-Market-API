const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    MS = require("../data/messages"),
    got = require("got"),
    { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } = require("../data/constants"),
    { getFindItemsQuery, drawItem, getNoImage, addLastOpenedItem } = require("../utilities/itemFunctions");

    
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
    getTryOutItems: async () => {
        try {
            const openableItems = await db.Item.find({ openable: true }).limit(3);
            return getResponsePayload(MS.SUCCESS, null, { items: openableItems, querySize: 3 });
        } catch (error) {
            return getResponsePayload(MS.FAIL, MS.GET_TRY_OUT_ITEMS_FAIL, null);
        }
    },
    getLastOpenedItems: async () => {
        try {
            const lastOpenedItems = await db.LastOpened.find().sort({ openedDate: "asc" }).limit(20);
            return getResponsePayload(MS.SUCCESS, null, lastOpenedItems);
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.GET_LAST_OPENED_ITEMS_FAIL, null);
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
                    user.save({ validateBeforeSave: false });
                    item.save({ validateBeforeSave: false });
    
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
                    user.save({ validateBeforeSave: false });
                    item.save({ validateBeforeSave: false });

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
                user.save({ validateBeforeSave: false });
                container.delete();
                
                await addLastOpenedItem({
                    containerName: container.name,
                    containerIconUrl: container.iconUrl,
                    itemName: drawnItem.name,
                    itemIconUrl: drawnItem.iconUrl,
                    itemType: drawnItem.type,
                    itemExterior: drawnItem.exterior,
                    itemRarity: drawnItem.rarity,
                    itemRarityColor: drawnItem.rarityColor,
                    itemPrice: drawnItem.price,
                    ownerUsername: user.username,
                    openedDate: new Date()
                });

                return getResponsePayload(MS.SUCCESS, null, { drawnItem: createdItem });
            }

            return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
        }
    },
    openTryOutContainer: async (containerId) => {
        try {
            const container = await db.Item.findById(containerId);

            if (container.openable) {
                const drawnItem = drawItem(container.content);
                return getResponsePayload(MS.SUCCESS, null, { drawnItem: drawnItem });
            } else {
                return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
            }
        } catch (error) {
            console.log(error);
            return getResponsePayload(MS.FAIL, MS.OPEN_CONTAINER_FAIL, null);
        }
    }
}