<<<<<<< HEAD
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";
// configuro il .env
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
=======
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
// configuro il .env
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
>>>>>>> origin/main
const requireAuth = async (req, res, next) => {
    //verifico che un utente sia autenticato
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "Richiesto token di autenticazione" });
    }
    const token = authorization.split(" ")[1];
    try {
        const { _id } = jwt.verify(token, process.env.SECRET);
<<<<<<< HEAD
        req.body.user = (await UserModel.findOne({ _id }).select("_id"))?._id;
=======
        req.body.user = await User.findOne({ _id }).select('_id');
>>>>>>> origin/main
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ error: "Richiesto non autorizzata" });
    }
};
export { requireAuth };
//# sourceMappingURL=requireAuth.js.map