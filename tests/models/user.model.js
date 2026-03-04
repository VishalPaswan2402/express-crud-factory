import mongoose from "mongoose";
const Schema = mongoose.Schema;

const defaultUserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DefaultPost"
    }]
})

const DefaultUser = mongoose.model("DefaultUser", defaultUserSchema);
export default DefaultUser;