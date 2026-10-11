import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListingDocument extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "Brand New" | "Like New" | "Good" | "Fair";
  images: string[];
  college: string;
  status: "active" | "sold" | "removed";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListingDocument>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["Brand New", "Like New", "Good", "Fair"],
      index: true,
    },
    images: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val.length <= 8,
        "A listing can have at most 8 images",
      ],
    },
    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ title: "text", description: "text" });
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ college: 1, status: 1 });
ListingSchema.index({ category: 1, status: 1, price: 1 });

const Listing: Model<IListingDocument> =
  mongoose.models.Listing || mongoose.model<IListingDocument>("Listing", ListingSchema);

export default Listing;
