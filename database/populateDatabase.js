const db = require("./defineSchemas"),
    items = require("../data/items.data"),
    containersData = require("../data/containersData");


const getItemName = (itemName) => {
    return itemName.replace(/\s\(.+\)/, "");
}

const getItemPrice = (item) => {
    if (item.price) {
        if (item.price.all_time) {
            return item.price.all_time.median;
        }
            
        return item.price[Object.keys(item.price)[0]].median;
    }

    return 50;
}

const populateItems = () => {
    const itemList = Object.values(items.items_list).map(item => ({
        name: getItemName(item.name),
        iconUrl: item.icon_url,
        type: item.type,
        weaponType: item.weapon_type,
        gunType: item.gun_type,
        exterior: item.exterior,
        rarity: item.rarity,
        rarityColor: item.rarity_color,
        price: getItemPrice(item)
    }));

    const openableContainers = Array.from(Array(100)).map(() => ({
        name: "Openable Case",
        iconUrl: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsRVx4MwFo5_T3eAQ3i6DMIW0X7ojiwoHax6egMOKGxj4G68Nz3-jCp4itjFWx-ktqfSmtcwqVx6sT",
        type: "Container",
        price: 100,
        openable: true,
        content: containersData
    }));
    
    db.Item.insertMany(itemList.concat(openableContainers))
    .then(() => {
        console.log("[populateDatabse.js] Items populated");
    })
    .catch(error => {
        console.log("[populateDatabase.js] Error occured: " + error);
    });
}

module.exports = populateItems;