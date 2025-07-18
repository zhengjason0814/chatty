import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { id_: { $ne: currentUserId } },
        { $id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in fetching recommended users", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends() {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest() {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself." });
    }

    const recipient = User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    } else if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user!" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A pending request exists between you and this user." });
    }
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sending friend request controller method", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
