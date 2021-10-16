const bcrypt = require("bcrypt"),
    db = require("../database/defineSchemas"),
    jwt = require("jsonwebtoken"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    { SUCCESS, FAIL, REGISTER_FAIL, LOGIN_FAIL, AUTHORIZATION_FAIL } = require("../data/messages");


const validatePassword = (password) => {
    if (password.length < 5) {
        return { valid: false, message: "Password is too short (min: 5, max: 50)" };
    } else if (password.length > 50) {
        return { valid: false, message: "Password is too long (min: 5, max: 50)" };
    } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(password)) {
        return { valid: false, message: "Password must contain at least one letter and one number" };
    }

    return { valid: true, message: null };
};

module.exports = {
    registerUser: async (body) => {
        try {
            const validPassword = validatePassword(body.password);

            if (validPassword.valid) {
                const hashedPassword = await bcrypt.hash(body.password, 10);
                await db.User.create({ username: body.username, password: hashedPassword });
    
                return getResponsePayload(SUCCESS, null, null);
            } else {
                return getResponsePayload(FAIL, validPassword.message, null);
            }
        } catch (error) {
            console.log(error);
            return getResponsePayload(FAIL, error.errors.username?.message, null);
        }
    },
    loginUser: async (body) => {
        try {
            const user = await db.User.findOne({ username: body.username });

            if (await bcrypt.compare(body.password, user.password)) {
                const expiresIn = `${ process.env.ACCESS_TOKEN_EXPIRATION_TIME ?? 300000 }`;
                const accessToken = jwt.sign(
                    { _id: user._id, username: user.username },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: expiresIn }
                );

                return getResponsePayload(SUCCESS, null, { accessToken, expiresIn, userData: {
                    username: user.username,
                    cash: user.cash,
                    userSettings: user.settings
                }});
            } else {
                return getResponsePayload(FAIL, LOGIN_FAIL, null);
            }
        } catch (error) {
            console.log(error);
            return getResponsePayload(FAIL, LOGIN_FAIL, null);
        }
    },
    authenticateToken: async (req, res, next) => {
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader?.split(" ")[1];
            if (!token) {
                return res.json(getResponsePayload(FAIL, AUTHORIZATION_FAIL, null));
            }
        
            const result = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            
            req.user = result;
            next();
        } catch (error) {
            console.log(error);
            res.json(getResponsePayload(FAIL, AUTHORIZATION_FAIL, null));
        }
    }
}