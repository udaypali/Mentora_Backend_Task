exports.profile = async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (err) {
        return res.status(500).json({message: "Server error"})
    }
}