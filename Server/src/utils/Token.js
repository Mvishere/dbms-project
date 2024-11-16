import jwt from "jsonwebtoken";

const generateAccessToken = async (User) => {

    const { id, name, email, role } = User

    return jwt.sign(
        {
            id: id,
            name: name,
            email: email,
            role: role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshToken = async (id) => {

    return jwt.sign(
        {
            id: id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export { generateAccessToken, generateRefreshToken }