import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    messages: [{
        text: { type: String, required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        timestamp: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

const groupModel = mongoose.models.group || mongoose.model('group', groupSchema);

export default groupModel;
