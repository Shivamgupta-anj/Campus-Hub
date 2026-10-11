import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  college: z.string().min(2, "Please select or enter your college"),
  course: z.string().min(2, "Course is required (e.g., B.Tech, B.Sc)"),
  branch: z.string().min(2, "Branch/Department is required (e.g., Computer Science, Mechanical)"),
  academicYear: z.string().min(1, "Academic year is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  college: z.string().min(2, "College must be at least 2 characters").optional(),
  course: z.string().min(2, "Course is required").optional(),
  branch: z.string().min(2, "Branch is required").optional(),
  academicYear: z.string().min(1, "Academic year is required").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  phoneNumber: z.string().max(20, "Invalid phone number").optional(),
  profileImage: z.string().optional(),
});

export const listingCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
  price: z.coerce.number().min(0, "Price must be 0 or higher"),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["Brand New", "Like New", "Good", "Fair"]),
  images: z.array(z.string()).max(8, "Maximum 8 images allowed").default([]),
  college: z.string().min(2, "College is required"),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const messageCreateSchema = z.object({
  text: z.string().min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters"),
});

export const reportCreateSchema = z.object({
  targetType: z.enum(["listing", "user"]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(3, "Reason is required"),
  description: z.string().max(1000).optional(),
});
