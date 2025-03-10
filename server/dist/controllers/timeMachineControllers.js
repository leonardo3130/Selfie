import { UserModel } from "../models/userModel.js";
export const setOffset = async (req, res) => {
    const userId = req.body.user;
    const dateOffset = req.body.offset;
    try {
        const user = await UserModel.findByIdAndUpdate(userId, { dateOffset });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
    res.status(200).json({ dateOffset });
};
export const getOffset = async (req, res) => {
    const userId = req.body.user;
    try {
        const user = await UserModel.findById(userId).select("dateOffset");
        if (!user) {
            throw Error("user doesn't exist");
        }
        res.status(200).json({ dateOffset: user.dateOffset });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=timeMachineControllers.js.map