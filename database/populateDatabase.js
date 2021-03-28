const { item } = require("./defineSchemas");
const items = require("../data/items.data");

const getItemPrice = (item) => {
    if (item.price) {
        if (item.price.all_time)
            return item.price.all_time.median;
            
        return item.price[Object.keys(item.price)[0]].median;
    }

    return 50;
}

const populateItems = () => {
    const itemList = Object.values(items.items_list).map(item => ({
        name: item.name,
        iconUrl: item.icon_url,
        type: item.type,
        weaponType: item.weapon_type,
        gunType: item.gun_type,
        exterior: item.exterior,
        rarity: item.rarity,
        rarityColor: item.rarity_color,
        price: getItemPrice(item)
    }));

    item.insertMany(itemList)
    .then(() => {
        console.log("[populateDatabse.js] Items populated");
    })
    .catch(error => {
        console.log("[populateDatabase.js] Error occured: " + error);
    });
}

module.exports = populateItems;