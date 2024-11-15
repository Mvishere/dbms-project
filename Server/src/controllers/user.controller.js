import db from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
    const { email, password, name, role } = req.body

    if (
        [role, name, email, password].some((field) => {
            return field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are required")
    }

    let usersWithSameEmail = (await db.query("select * from users where email=$1", [email])).rows.length
    if (usersWithSameEmail != 0) {
        throw new ApiError(400, "Email Already Used")
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
        throw new ApiError(400, "User does not exist")
    }

    const storedPassword = (await db.query("select password from users where email=$1", [email])).rows[0].password

    let passStatus = await bcrypt.compare(password, storedPassword)

    if (!passStatus) {
        throw new ApiError(400, "Incorrect password")
    }

    const role = (await db.query("select role from users where email=$1", [email])).rows[0].role

    return res.status(200).json(new ApiResponse(
        200,
        {
            email: email,
            role: role
        },
        "User logged in"
    ))
})

export { registerUser, loginUser }