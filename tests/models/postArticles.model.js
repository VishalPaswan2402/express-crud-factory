import mongoose from "mongoose";
const Schema = mongoose.Schema;

const defaultPostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "DefaultUser",
        required: true
    },
    likes: {
        type: Number,
        default: () => Math.floor(Math.random() * 1000 + 1)
    },
    comments: {
        type: Number,
        default: () => Math.floor(Math.random() * 100 + 1)
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isTrashed: {
        type: Boolean,
        default: false
    },
    deleteAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

defaultPostSchema.index(
    { deleteAt: 1 },
    { expireAfterSeconds: 0 }
);

const PostModel = mongoose.model("DefaultPost", defaultPostSchema);
export default PostModel;