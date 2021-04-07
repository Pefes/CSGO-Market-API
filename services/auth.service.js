const bcrypt = require("bcrypt"),
    db = require("../database/defineSchemas"),
    jwt = require("jsonwebtoken"),
    getResponsePayload = require("../utilities/getResponsePayload"),
    { SUCCESS, FAIL, REGISTER_FAIL, LOGIN_FAIL, AUTHORIZATION_FAIL } = require("../data/messages");


module.exports = {
    registerUser: async (body) => {
        try {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            await db.User.create({ username: body.username, password: hashedPassword });

            return getResponsePayload(SUCCESS, null, null);
        } catch {
            return getResponsePayload(FAIL, REGISTER_FAIL, null);
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

                return getResponsePayload(SUCCESS, null, { accessToken, expiresIn });
            } else {
                return getResponsePayload(FAIL, LOGIN_FAIL, null);
            }
        } catch {
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
        } catch {
            res.json(getResponsePayload(FAIL, AUTHORIZATION_FAIL, null));
        }
    }
}