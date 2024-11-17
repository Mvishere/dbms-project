import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import db from "../db/index.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.body.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken
        if (!token) {
            return res.status(401).json("Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const result = await db.query("select user_id, name, email, role from users where email=$1", [decodedToken.email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json("Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        return res.status(401).json(error.message || "Invalid Access Token")
    }

})