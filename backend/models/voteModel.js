import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Store the user's state at the time of voting for eligibility verification
    userState: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user can only vote once per election
voteSchema.index({ user: 1, election: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", voteSchema);