import db from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js"

const generateAccessAndRefreshTokens = async (email) => {
    try {
        const result = await db.query("select user_id, name, email, role from users where email=$1", [email]);
        const user = result.rows[0];
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user.user_id)
        await db.query("update users set refresh_token=$1 where user_id=$2", [refreshToken, user.user_id])

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token" + error)
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { email, password, name, role } = req.body

    if (
        [role, name, email, password].some((field) => {
            return field?.trim() === ""
        })
    ) {
        return res.status(400).json("All fields are required")
    }

    let usersWithSameEmail = (await db.query("select * from users where email=$1", [email])).rows.length
    if (usersWithSameEmail != 0) {
        return res.status(400).json("Email Already Used")
    }

    let hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
    try {
        db.query("insert into users (name, email, role, password) values ($1, $2, $3, $4)", [name, email, role, hash])
    } catch (error) {
        console.log("Error in inserting: ", error)
    }

    return res.status(200).json(new ApiResponse(200, {
        name: name,
        email: email,
        role: role,
    }, "User created successfully"
    )
    )
})

const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    let usersWithSameEmail = (await db.query("select * from users where email=$1", [email])).rows.length

    if (usersWithSameEmail == 0) {
        return res.status(400).json("User not found");
    }

    const storedPassword = (await db.query("select password from users where email=$1", [email])).rows[0].password

    let passStatus = await bcrypt.compare(password, storedPassword)

    if (!passStatus) {
        return res.status(400).json("Incorrect password");
    }

    const role = (await db.query("select role from users where email=$1", [email])).rows[0].role

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(email);

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                email: email,
                role: role,
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            "User logged in"
        ))
})

const logoutUser = asyncHandler(async (req, res, next) => {
    await db.query("update users set refresh_token=null where user_id=$1", [req.user.user_id])

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.cookies.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json("Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const result = await db.query("select user_id, name, email, role, refresh_token from users where user_id=$1", [decodedToken.id])
        const user = result.rows[0]

        if (!user) {
            return res.status(401).json("Invalid refresh token");
        }

        if (incomingRefreshToken != user?.refresh_token) {
            return res.status(401).json("Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.email)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }, "Access token refreshed"
                )
            )
    } catch (error) {
        return res.status(401).json(error?.message || "Invalid refresh token")
    }
})

const studentDoubts = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(401).json("Unauthorized access")
    }
    const doubts = await db.query("select doubts.doubt_id, title, description, status, response_text response from doubts left join doubt_responses on doubts.doubt_id = doubt_responses.doubt_id where user_id=$1", [req.user.user_id]);
    res.json(doubts.rows)
})

const postStudentDoubts = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(401).json("Unauthorized access")
    }
    await db.query("insert into doubts (user_id, title, description) values ($1, $2, $3)", [req.user.user_id, req.body.title, req.body.description])
    res.status(200).json("doubt posted successfully")
})

const mentorDoubts = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "mentor") {
        return res.status(401).json("Unauthorized access")
    }
    const doubts = await db.query("select doubts.doubt_id, title, description, status, response_text response from doubts left join doubt_responses on doubts.doubt_id = doubt_responses.doubt_id");
    res.status(200).json(doubts.rows)
})

const respondDoubt = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "mentor") {
        return res.status(401).json("Unauthorized access")
    }
    await db.query("insert into doubt_responses (doubt_id, mentor_id, response_text) values ($1, $2, $3)", [req.body.doubt_id, req.user.user_id, req.body.response_text])
    res.status(200).json("doubt responded successfully")
})

const deleteDoubt = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(401).json("Unauthorized access")
    }
    const { id } = req.body;
    try {
        const result = await db.query("delete from doubts where doubt_id=$1", [id])

        return res.status(200).json({ message: "Doubt deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }

})

const deleteResponse = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "mentor") {
        return res.status(401).json("Unauthorized access")
    }
    const { doubt_id } = req.body;
    try {
        await db.query("delete from doubt_responses where doubt_id=$1", [doubt_id]);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
})

const mentorSchedule = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "mentor") {
        return res.status(401).json("Unauthorized access")
    }
    const time_stamp = req.body.time_slot
    await db.query("insert into schedules (mentor_id, time_slot) values ($1, $2);", [req.user.user_id, time_stamp])
    return res.status(200).json({ message: "Schedule created" })
})

const getSchedule = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "mentor") {
        return res.status(401).json("Unauthorized access")
    }
    const result = await db.query("select time_slot, is_booked status from schedules where mentor_id=$1", [req.user.user_id])
    return res.status(200).json(result.rows);
})

const getScheduleStudent = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(401).json("Unauthorized access")
    }

    const schedules = await db.query("select schedule_id, mentor_id, name, email, time_slot from users inner join schedules on users.user_id = schedules.mentor_id");
    return res.status(200).json(schedules.rows);
})

const bookSchedule = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(401).json("Unauthorized access")
    }

    await db.query("insert into booked (mentor_id,  student_id, schedule_id, booking_time) values ($1, $2, $3, $4)", [req.body.mentor_id, req.user.user_id, req.body.schedule_id, req.body.time_slot])
    return res.status(200).json("session booked");
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, studentDoubts, postStudentDoubts, mentorDoubts, respondDoubt, deleteDoubt, deleteResponse, mentorSchedule, getSchedule, getScheduleStudent, bookSchedule }