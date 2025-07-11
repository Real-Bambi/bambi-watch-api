import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const roomSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: [true, "Video ID is required"],
    },
    name: {
      type: String,
      default: "Untitled Room",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

roomSchema.plugin(normalize);
export const Room = mongoose.model("Room", roomSchema);


