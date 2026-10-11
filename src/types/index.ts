export type UserRole = "student" | "admin";
export type UserStatus = "active" | "suspended";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  college: string;
  course: string;
  branch: string;
  academicYear: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type ListingCondition = "Brand New" | "Like New" | "Good" | "Fair";
export type ListingStatus = "active" | "sold" | "removed";

export interface IListing {
  _id: string;
  sellerId: string | IUser;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ListingCondition;
  images: string[];
  college: string;
  status: ListingStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISavedListing {
  _id: string;
  userId: string;
  listingId: string | IListing;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string | IUser;
  text: string;
  readAt?: string;
  createdAt: string;
}

export interface IConversation {
  _id: string;
  participants: (string | IUser)[];
  listingId: string | IListing;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportTargetType = "listing" | "user";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface IReport {
  _id: string;
  reporterId: string | IUser;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: "message" | "listing_sold" | "report_update" | "system";
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  college: string;
  role: UserRole;
  status: UserStatus;
}
