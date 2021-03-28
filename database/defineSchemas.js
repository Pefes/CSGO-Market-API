const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: String,
    iconUrl: String,
    type: String,
    weaponType: String,
    gunType: String,
    exterior: String,
    rarity: String,
    rarityColor: String,
    price: Number
});

const ItemModel = mongoose.model("Item", ItemSchema);

module.exports = {
    item: ItemModel
};