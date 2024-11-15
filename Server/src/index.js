import dotenv from "dotenv"
import db from "./db/index.js";
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

