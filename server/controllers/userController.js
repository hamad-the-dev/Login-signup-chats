import userModel from "../models/userModel.js";


export const getUserData = async (req, res) => {
try {

    const userid = req.query.userid || req.body.userid;
    if (!userid) {
        return res.json({ success: false, message: 'User ID not found in request' });
    }
    const user = await userModel.findById(userid);
    if (!user) {
        return res.json({ success: false, message: 'User not found' });
    }    res.json({
         success: true,
         userData: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
}catch (error) {
    return res.json({ success: false, message: error.message });
}
}

export const getAllUsersExceptMe = async (req, res) => {
  try {
    const { userid } = req.body;
    const users = await userModel.find({ _id: { $ne: userid } }, { password: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};