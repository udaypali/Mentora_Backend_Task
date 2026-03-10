const {signup } = require('./signupController')
const {login} = require('./loginController')
const {profile, deleteProfile, updateProfile} = require('./profileController')

module.exports = {
    signup,
    login,
    profile,
    deleteProfile,
    updateProfile
}