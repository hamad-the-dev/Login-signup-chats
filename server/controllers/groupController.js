import mongoose from "mongoose";
import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";
import messageModel from "../models/messageModel.js";

export const createGroup = async (req, res) => {
    try {        const { name, members, userId } = req.body;
        
        
        const memberIds = [...new Set([...members, userId])].map(id => new mongoose.Types.ObjectId(id));

        const newGroup = new groupModel({
            name,
            members: memberIds,
            createdBy: new mongoose.Types.ObjectId(userId),
        });

        await newGroup.save();

        // Populate members data
        const group = await newGroup.populate('members', 'name email');

        res.json({
            success: true,
            message: 'Group created successfully',
            group
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.query.userid || req.body.userid;
        
        if (!userId) {
            console.log('No user ID found in request:', { query: req.query, body: req.body });
            return res.status(401).json({ success: false, message: 'Unauthorized - User ID not found' });
        }        console.log('Fetching groups for user:', userId);
        const groups = await groupModel.find({ members: new mongoose.Types.ObjectId(userId) })
            .populate({
                path: 'members',
                select: 'name email _id'
            })
            .populate({
                path: 'createdBy',
                select: 'name email _id'
            })
            .populate({
                path: 'messages.sender',
                select: 'name _id'
            });

        res.json({
            success: true,
            groups
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;        const { name, members } = req.body;

        const memberIds = members.map(id => new mongoose.Types.ObjectId(id));

        const group = await groupModel.findByIdAndUpdate(
            groupId,
            { 
                name, 
                members: memberIds 
            },
            { new: true }
        ).populate('members', 'name email');

        res.json({
            success: true,
            message: 'Group updated successfully',
            group
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        await groupModel.findByIdAndDelete(groupId);

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const renameGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;

        const group = await groupModel.findByIdAndUpdate(
            groupId,
            { name },
            { new: true }
        )
        .populate({
            path: 'members',
            select: 'name email _id'
        })
        .populate({
            path: 'createdBy',
            select: 'name email _id'
        })
        .populate({
            path: 'messages.sender',
            select: 'name _id'
        });

        if (!group) {
            return res.json({
                success: false,
                message: 'Group not found'
            });
        }

        res.json({
            success: true,
            message: 'Group renamed successfully',
            group
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { groupId, text, sender } = req.body;

        const [group, senderUser] = await Promise.all([
            groupModel.findById(groupId),
            userModel.findById(sender)
        ]);

        if (!group) {
            return res.json({ success: false, message: 'Group not found' });
        }

        if (!senderUser) {
            return res.json({ success: false, message: 'User not found' });
        }
        const newMessage = {
            text,
            sender: new mongoose.Types.ObjectId(sender),
            timestamp: new Date()
        };
        group.messages.push(newMessage);
        await group.save();
        res.json({
            success: true,
            message: {
                id: newMessage._id,
                text: newMessage.text,
                sender: senderUser.name,
                timestamp: newMessage.timestamp
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await groupModel.find({})
            .populate({
                path: 'members',
                select: 'name email _id'
            })
            .populate({
                path: 'createdBy',
                select: 'name email _id'
            })
            .populate({
                path: 'messages.sender',
                select: 'name _id'
            });

        res.json({
            success: true,
            groups
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const deleteMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await groupModel.findById(groupId);
        if (!group) {
            return res.json({
                success: false,
                message: 'Group not found'
            });
        }
        group.messages = [];
        await group.save();

        res.json({
            success: true,
            message: 'Messages deleted successfully'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        
        const group = await groupModel.findById(groupId);
        if (!group) {
            return res.json({
                success: false,
                message: 'Group not found'
            });
        }

        // Find index of message to delete
        const messageIndex = group.messages.findIndex(msg => msg._id.toString() === messageId);
        if (messageIndex === -1) {
            return res.json({
                success: false,
                message: 'Message not found'
            });
        }

        // Remove message from array
        group.messages.splice(messageIndex, 1);
        await group.save();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

