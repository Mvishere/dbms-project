import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import db from "../db/index.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.body.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const result = await db.query("select user_id, name, email, role from users where email=$1", [decodedToken.email]);
        const user = result.rows[0];

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})