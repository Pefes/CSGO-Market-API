const db = require("../database/defineSchemas"),
    fs = require("fs");


const escapeRegExp = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
    getFindItemsQuery: (filtersData) => {
        const itemName = filtersData.name ?? "";
        const itemType = filtersData.type ?? "";
        const itemRarity = filtersData.rarity ?? "";
        const itemExterior = filtersData.exterior ?? "";
        const itemOpenable = filtersData.openable;
        const regExpOptions = "i";
        
        return {
            name: { $exists: true, $regex: new RegExp(escapeRegExp(itemName), regExpOptions) },
            type: { $exists: true, $regex: new RegExp(escapeRegExp(itemType), regExpOptions) },
            $and: [
                {
                    $or: [
                        { exterior: { $regex: new RegExp(escapeRegExp(itemExterior), regExpOptions) } },
                        { exterior: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { rarity: { $regex: new RegExp(escapeRegExp(itemRarity), regExpOptions) } },
                        { rarity: { $exists: false } }
                    ]
                },
            ],
            ...(itemOpenable === "true" || itemOpenable === "false" ? { openable: itemOpenable } : {})
        };
    },
    drawItem: (contentItems) => {
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
    },
    getNoImage: () => {
        return fs.readFileSync("./data/images/no-image.png")
    },
    addLastOpenedItem: async (lastOpenedItem) => {
        try {
            const lastOpenedCount = await db.LastOpened.countDocuments();
            await db.LastOpened.create(lastOpenedItem);

            if (lastOpenedCount >= 20) {
                const oldestOpenedItem = await db.LastOpened.findOne().sort({ openedDate: "asc" });
                await oldestOpenedItem.delete();
            }
        } catch (error) {
            console.log(error);
        }
    }
};