import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedListingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedListingSchema = new Schema<ISavedListingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved entries for same user and listing
SavedListingSchema.index({ userId: 1, listingId: 1 }, { unique: true });

const SavedListing: Model<ISavedListingDocument> =
  mongoose.models.SavedListing ||
  mongoose.model<ISavedListingDocument>("SavedListing", SavedListingSchema);

export default SavedListing;
