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
    price: Number,
    purchasable: {
        type: Boolean,
        default: true
    },
    openable: {
        type: Boolean,
        default: false
    },
    content: [{
        name: String,
        iconUrl: String,
        rarity: String,
        rarityColor: String
    }]
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: [5, "Username is too short (min: 5, max: 50)"],
        maxLength: [50, "Username is too long (min: 5, max: 50)"],
        validate: {
            validator: async function(username) {
                const user = await this.constructor.findOne({ username: username });
                return !user;
            },
            message: "Username already exists"
        }
    },
    password: {
        type: String,
        required: true
    },
    cash: {
        type: Number,
        default: 1000
    },
    settings: {
        darkTheme: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: "en"
        }
    },
    ownedItems: [Schema.Types.ObjectId]
});

const ItemModel = mongoose.model("Item", ItemSchema);
const UserModel = mongoose.model("User", UserSchema);

module.exports = {
    Item: ItemModel,
    User: UserModel
};