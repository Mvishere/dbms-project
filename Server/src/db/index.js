import pg from "pg";
import { app } from '../app.js';

const db = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASS,
    database: 'Doubt_solving_app'
})

db.connect()
    .then(() => {
        app.on("error", (err) => {
            console.log("Error in app: ", err)
            process.exit(1)
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("Postgres db connection failed !!! ", err);
    })

export default db;