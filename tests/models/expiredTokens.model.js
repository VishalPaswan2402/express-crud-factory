import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const expiredTokensSchema = new Schema({
    accessToken: {
        type: String,
        required: true
    },
    expireTime: {
        type: Date,
        required: true
    }
});

expiredTokensSchema.index(
    { expireTime: 1 },
    { expireAfterSeconds: 0 }
);

const ExpiredTokensModel = mongoose.model("ExpiredTokensModel", expiredTokensSchema);
export default ExpiredTokensModel;