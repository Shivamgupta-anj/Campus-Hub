import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Listing from "../src/models/Listing";
import Category from "../src/models/Category";
import Conversation from "../src/models/Conversation";
import Message from "../src/models/Message";
import SavedListing from "../src/models/SavedListing";
import Report from "../src/models/Report";
import { CATEGORIES } from "../src/lib/constants";

import { config } from "dotenv";
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campushub";

async function hashPwd(pwd: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pwd, salt);
}

async function seed() {
  console.log("Connecting to MongoDB Atlas at URI...");
  await mongoose.connect(MONGODB_URI, { dbName: "campushub" });
  console.log("Connected successfully to database:", mongoose.connection.name);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Category.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    SavedListing.deleteMany({}),
    Report.deleteMany({}),
  ]);
  console.log("Cleared existing database records.");

  // Seed Categories
  console.log("Seeding categories...");
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    await Category.create({
      slug: cat.id,
      name: cat.name,
      icon: cat.icon,
      description: cat.description,
      status: "active",
      order: i + 1,
    });
  }

  // Common password hash for demo accounts
  const studentPasswordHash = await hashPwd("Student@123");
  const adminPasswordHash = await hashPwd("Admin@123");

  console.log("Seeding users...");
  const adminUser = await User.create({
    name: "CampusHub Administrator",
    email: "admin@campushub.edu",
    passwordHash: adminPasswordHash,
    college: "Delhi Technological University (DTU)",
    course: "Administration",
    branch: "Campus Affairs",
    academicYear: "Faculty / Staff",
    role: "admin",
    status: "active",
    bio: "Official campus marketplace administrator and safety supervisor.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  });

  const student1 = await User.create({
    name: "Aarav Sharma",
    email: "aarav.sharma@iitd.ac.in",
    passwordHash: studentPasswordHash,
    college: "Indian Institute of Technology (IIT) Delhi",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    academicYear: "3rd Year (Junior)",
    role: "student",
    status: "active",
    bio: "Senior CS undergrad. Selling textbooks and tech gadgets as I wrap up the semester.",
    phoneNumber: "+91 98765 43210",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  });

  const student2 = await User.create({
    name: "Priya Patel",
    email: "priya.patel@dtu.ac.in",
    passwordHash: studentPasswordHash,
    college: "Delhi Technological University (DTU)",
    course: "B.Tech",
    branch: "Electronics & Communication",
    academicYear: "2nd Year (Sophomore)",
    role: "student",
    status: "active",
    bio: "ECE student staying in hostel 4. Frequent buyer and seller of engineering stationery.",
    phoneNumber: "+91 98123 45678",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  });

  const student3 = await User.create({
    name: "Rohan Verma",
    email: "rohan.verma@nsut.ac.in",
    passwordHash: studentPasswordHash,
    college: "Netaji Subhas University of Technology (NSUT)",
    course: "B.Tech",
    branch: "Mechanical Engineering",
    academicYear: "4th Year (Senior)",
    role: "student",
    status: "active",
    bio: "Final year student clearing out room furniture and mobility gear before graduation.",
    phoneNumber: "+91 97654 32109",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  });

  const student4 = await User.create({
    name: "Ananya Gupta",
    email: "ananya.gupta@pilani.bits-pilani.ac.in",
    passwordHash: studentPasswordHash,
    college: "Birla Institute of Technology and Science (BITS) Pilani",
    course: "B.E.",
    branch: "Electrical & Instrumentation",
    academicYear: "1st Year (Freshman)",
    role: "student",
    status: "active",
    bio: "Freshman eager to connect and trade course books and dorm accessories.",
    phoneNumber: "+91 99887 76655",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
  });

  console.log("Seeding marketplace listings...");
  const listingsData = [
    {
      sellerId: student1._id,
      title: "Casio FX-991EX ClassWiz Scientific Calculator",
      description: "Authentic Casio ClassWiz fx-991EX scientific calculator with 552 functions. Used for two semesters in Engineering Maths. Pristine condition with solar panel working flawlessly and protective hard slip-case included.",
      price: 850,
      category: "calculators",
      condition: "Like New",
      college: "Indian Institute of Technology (IIT) Delhi",
      images: [
        "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 142,
    },
    {
      sellerId: student1._id,
      title: "Dell 24-inch UltraSharp Full HD IPS Monitor (U2415)",
      description: "24-inch 1920x1200 16:10 aspect ratio IPS monitor with ultra-thin bezels. Ideal for coding, reading papers, and multi-window work. Comes with power cable, HDMI cord, and adjustable ergonomic stand (pivot, swivel, height). Zero dead pixels.",
      price: 5800,
      category: "electronics",
      condition: "Good",
      college: "Indian Institute of Technology (IIT) Delhi",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 310,
    },
    {
      sellerId: student2._id,
      title: "Engineering Mechanics by S. Timoshenko & D.H. Young (5th Ed)",
      description: "Standard syllabus textbook for first and second year engineering. Clean pages with minimal pencil annotations. Binding is completely intact and covers are wrapped in plastic sheet.",
      price: 320,
      category: "textbooks",
      condition: "Good",
      college: "Delhi Technological University (DTU)",
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 89,
    },
    {
      sellerId: student2._id,
      title: "Omega Engineering Mini Drafter with Unbreakable Scale & Cover",
      description: "Essential for 1st Year Engineering Graphics / Drawing. Features smooth dual-arm pivot mechanism, 360-degree protractor head, and lock knob. Includes heavy-duty water-resistant carrying case and sheet container tube.",
      price: 450,
      category: "stationery",
      condition: "Like New",
      college: "Delhi Technological University (DTU)",
      images: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 124,
    },
    {
      sellerId: student3._id,
      title: "Hercules Roadeo 21-Speed Geared Mountain Bicycle",
      description: "Sturdy aluminum frame campus cycle with front suspension fork and Shimano 21-speed thumb shifters. Recently serviced with new brake pads, chain lubrication, and mudguards installed. Comes with heavy steel wire number lock.",
      price: 3600,
      category: "cycles",
      condition: "Good",
      college: "Netaji Subhas University of Technology (NSUT)",
      images: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 480,
    },
    {
      sellerId: student3._id,
      title: "Hostel Study Desk & Ergonomic Mesh Swivel Chair",
      description: "Engineered wood study table (3x2 ft) with drawer and lower storage shelf. Paired with breathable mesh office chair with pneumatic height adjustment. Moving out of hostel room, ready for pickup anytime this weekend.",
      price: 1800,
      category: "hostel-essentials",
      condition: "Good",
      college: "Netaji Subhas University of Technology (NSUT)",
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 205,
    },
    {
      sellerId: student4._id,
      title: "Pigeon Kessel 1.2L Stainless Steel Multi-Cooker Electric Kettle",
      description: "Fast-boiling electric kettle essential for late-night hostel study sessions. Great for boiling water, tea, noodles, and eggs. Auto shut-off safety protection, cool-touch handle, 360-degree swivel base.",
      price: 490,
      category: "hostel-essentials",
      condition: "Like New",
      college: "Birla Institute of Technology and Science (BITS) Pilani",
      images: [
        "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 95,
    },
    {
      sellerId: student4._id,
      title: "Wildcraft 35L Campus Laptop Backpack (Rain Cover Included)",
      description: "Ergonomic 3-compartment college backpack with dedicated padded 15.6-inch laptop compartment, organizer pockets, side mesh bottle holders, and concealed rain cover. Durable water-resistant polyester fabric.",
      price: 750,
      category: "accessories",
      condition: "Good",
      college: "Birla Institute of Technology and Science (BITS) Pilani",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 110,
    },
    {
      sellerId: student2._id,
      title: "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones",
      description: "Up to 50-hour battery life with quick charge, multipoint Bluetooth connection, DSEE digital sound enhancement, and crystal-clear hands-free microphone. Lightweight and comfortable for long library study hours.",
      price: 2600,
      category: "electronics",
      condition: "Brand New",
      college: "Delhi Technological University (DTU)",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      ],
      status: "active",
      views: 340,
    },
    {
      sellerId: student1._id,
      title: "Official College Chemistry Lab Coat (Unisex, Size M)",
      description: "Standard white cotton laboratory coat with knee length, three front pockets, and durable button closures. Required for Chemistry and Biology lab sessions. Washed and ironed, ready to wear.",
      price: 220,
      category: "fashion",
      condition: "Like New",
      college: "Indian Institute of Technology (IIT) Delhi",
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      ],
      status: "sold",
      views: 175,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdListings: any[] = [];
  for (const item of listingsData) {
    const listing = await Listing.create(item);
    createdListings.push(listing);
  }

  // Seed Saved Listing for Student 2
  console.log("Seeding saved listings...");
  await SavedListing.create({
    userId: student2._id,
    listingId: createdListings[0]._id, // Casio Calculator
  });
  await SavedListing.create({
    userId: student2._id,
    listingId: createdListings[1]._id, // Dell Monitor
  });

  // Seed a sample Conversation and Message
  console.log("Seeding sample conversation...");
  const conv = await Conversation.create({
    participants: [student2._id, student1._id],
    listingId: createdListings[0]._id, // Casio Calculator
    lastMessage: "Hi Aarav, is this calculator still available? Can we meet at the campus library?",
    lastMessageAt: new Date(),
  });

  await Message.create({
    conversationId: conv._id,
    senderId: student2._id,
    text: "Hi Aarav, is this calculator still available? Can we meet at the campus library?",
  });

  await Message.create({
    conversationId: conv._id,
    senderId: student1._id,
    text: "Hey Priya! Yes, absolutely. I'm around the library reading room today till 5 PM.",
    readAt: new Date(),
  });

  // Seed a sample Report for Admin inspection
  console.log("Seeding sample report for moderation...");
  await Report.create({
    reporterId: student3._id,
    targetType: "listing",
    targetId: createdListings[4]._id.toString(), // Mountain bicycle
    reason: "Duplicate or test listing suspected",
    description: "Seller posted a similar cycle item twice yesterday.",
    status: "pending",
  });

  console.log("\n========================================================");
  console.log("🎉 CAMPUSHUB DATABASE SEEDED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("DEMO ACCOUNTS READY TO TEST:");
  console.log("--------------------------------------------------------");
  console.log("1. STUDENT ACCOUNT (Aarav Sharma - IIT Delhi)");
  console.log("   Email:    aarav.sharma@iitd.ac.in");
  console.log("   Password: Student@123");
  console.log("");
  console.log("2. STUDENT ACCOUNT (Priya Patel - DTU)");
  console.log("   Email:    priya.patel@dtu.ac.in");
  console.log("   Password: Student@123");
  console.log("");
  console.log("3. ADMINISTRATOR ACCOUNT (Campus Affairs Moderator)");
  console.log("   Email:    admin@campushub.edu");
  console.log("   Password: Admin@123");
  console.log("========================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
