const db = require("../database/defineSchemas"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    { SUCCESS, FAIL, GET_AUTOCOMPLETE_OPTIONS_FAIL, GET_AUTOCOMPLETE_OPTIONS_FAIL_NO_PROPERTY, SET_USER_SETTINGS_FAIL } = require("../data/messages");


module.exports = {
    getAutocompleteOptions: async (property) => {
        try {
            if (property) {
                const options = await db.Item.find().distinct(property);
                const filteredOptions = options.filter(option => option);
                return getResponsePayload(SUCCESS, null, filteredOptions);
            } else {
                return getResponsePayload(FAIL, GET_AUTOCOMPLETE_OPTIONS_FAIL_NO_PROPERTY, null);
            }
        } catch (error) {
            console.log(error);
            return getResponsePayload(FAIL, GET_AUTOCOMPLETE_OPTIONS_FAIL, null);
        }
    },
    setUserSettings: async (loggedInUser, newUserSettings) => {
        try {
            if (newUserSettings) {
                const user = await db.User.findById(loggedInUser._id);
                user.settings = { ...newUserSettings };
                user.save({ validateBeforeSave: false });
                return getResponsePayload(SUCCESS, null, null);
            } else {
                return getResponsePayload(FAIL, SET_USER_SETTINGS_FAIL, null);
            }
        } catch (error) {
            console.log(error);
            return getResponsePayload(FAIL, SET_USER_SETTINGS_FAIL, null);
        }
    }
}