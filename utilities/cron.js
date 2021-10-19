const cron = require("node-cron"),
    lastOpenedItemsData = require("../data/lastOpenedItemsData"),
    { addLastOpenedItem } = require("./itemFunctions");


const runCron = () => {
    cron.schedule("*/15 * * * * *", () => {
        addLastOpenedItem({
            ...lastOpenedItemsData[Math.floor(Math.random() * lastOpenedItemsData.length)],
            openedDate: new Date()
        });
    });
};


module.exports = runCron;