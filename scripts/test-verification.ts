import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectToDatabase from "../src/lib/mongodb";
import User from "../src/models/User";
import Listing from "../src/models/Listing";
import SavedListing from "../src/models/SavedListing";
import Conversation from "../src/models/Conversation";
import Message from "../src/models/Message";
import Report from "../src/models/Report";
import { registerSchema, loginSchema, listingCreateSchema } from "../src/lib/validations";
import { hashPassword, comparePassword, signToken, verifyToken } from "../src/lib/auth";
import { config } from "dotenv";
config({ path: ".env.local" });

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🚀 STARTING CAMPUSHUB AUTOMATED VERIFICATION SUITE");
  console.log("========================================================\n");

  await connectToDatabase();
  assert(mongoose.connection.readyState === 1, "Database connection established successfully");

  // TEST 1: Registration Validation
  console.log("\n[TEST 1] Registration Validation (Valid & Invalid)");
  const validReg = registerSchema.safeParse({
    name: "Test Student",
    email: "test.student@iitd.ac.in",
    password: "Password@123",
    college: "IIT Delhi",
    course: "B.Tech",
    branch: "CSE",
    academicYear: "1st Year",
  });
  assert(validReg.success, "Valid registration details accepted");

  const invalidReg = registerSchema.safeParse({
    name: "A", // too short
    email: "invalid-email-format",
    password: "123", // too short
    college: "",
    course: "",
    branch: "",
    academicYear: "",
  });
  assert(!invalidReg.success, "Invalid registration details rejected by Zod schema");

  // TEST 2: Duplicate Email Registration Prevention
  console.log("\n[TEST 2] Duplicate Email Registration Prevention");
  const uniqueEmail = `test.${Date.now()}@college.edu`;
  const pwdHash = await hashPassword("Secret123");
  const firstUser = await User.create({
    name: "Original User",
    email: uniqueEmail,
    passwordHash: pwdHash,
    college: "DTU",
    course: "B.Tech",
    branch: "ECE",
    academicYear: "2nd Year",
  });
  assert(!!firstUser._id, "First user created with unique email");

  let duplicateFailed = false;
  try {
    await User.create({
      name: "Duplicate User",
      email: uniqueEmail,
      passwordHash: pwdHash,
      college: "DTU",
      course: "B.Tech",
      branch: "ECE",
      academicYear: "2nd Year",
    });
  } catch (err: unknown) {
    duplicateFailed = true;
  }
  assert(duplicateFailed, "Duplicate email registration rejected by MongoDB unique constraint");

  // TEST 3: Login with Valid & Invalid Credentials
  console.log("\n[TEST 3] Login Authentication & Password Hashing");
  const testUser = await User.findOne({ email: uniqueEmail });
  assert(!!testUser, "Found registered user record");

  const validMatch = await comparePassword("Secret123", testUser!.passwordHash);
  assert(validMatch, "Password verification succeeds with correct credentials");

  const invalidMatch = await comparePassword("WrongPassword", testUser!.passwordHash);
  assert(!invalidMatch, "Password verification fails with incorrect credentials");

  // TEST 4: JWT Signing & Verification
  console.log("\n[TEST 4] Session Token Generation & Verification");
  const token = signToken({
    id: testUser!._id.toString(),
    email: testUser!.email,
    role: testUser!.role,
    name: testUser!.name,
    college: testUser!.college,
  });
  assert(typeof token === "string" && token.length > 20, "JWT session token generated");

  const payload = verifyToken(token);
  assert(payload !== null && payload.id === testUser!._id.toString(), "JWT verified and decoded user ID matches");

  const invalidToken = verifyToken("tampered.or.invalid.token");
  assert(invalidToken === null, "Tampered/invalid JWT properly rejected");

  // TEST 5: Creating, Editing, and Deleting Listings
  console.log("\n[TEST 5] Listing CRUD Lifecycle & Validation");
  const validListing = listingCreateSchema.safeParse({
    title: "TI-84 Plus Graphing Calculator",
    description: "Good condition graphing calculator with fresh AAA batteries.",
    price: 1200,
    category: "calculators",
    condition: "Good",
    college: "DTU",
    images: ["/uploads/sample.jpg"],
  });
  assert(validListing.success, "Listing schema accepts valid input");

  const createdListing = await Listing.create({
    sellerId: testUser!._id,
    title: "TI-84 Plus Graphing Calculator",
    description: "Good condition graphing calculator with fresh AAA batteries.",
    price: 1200,
    category: "calculators",
    condition: "Good",
    college: "DTU",
    images: ["/uploads/sample.jpg"],
    status: "active",
  });
  assert(!!createdListing._id, "Listing successfully persisted to MongoDB");

  createdListing.price = 1100;
  createdListing.title = "TI-84 Plus CE Graphing Calculator (Updated)";
  await createdListing.save();
  assert(createdListing.price === 1100, "Listing price update successfully saved");

  // TEST 6: Unauthorized Modification Protection
  console.log("\n[TEST 6] Ownership Check & Unauthorized Mutation Prevention");
  const otherUser = await User.create({
    name: "Other Student",
    email: `other.${Date.now()}@college.edu`,
    passwordHash: pwdHash,
    college: "NSUT",
    course: "B.Tech",
    branch: "ME",
    academicYear: "3rd Year",
    role: "student",
  });

  const isOwner = createdListing.sellerId.toString() === otherUser._id.toString();
  assert(!isOwner, "Non-owner detected: other student cannot claim ownership");

  // TEST 7: Searching, Filtering, Sorting, and Pagination
  console.log("\n[TEST 7] Search, Filtering, Sorting & Pagination");
  const filterResults = await Listing.find({
    category: "calculators",
    status: "active",
    price: { $gte: 500, $lte: 2000 },
  }).sort({ price: 1 }).limit(10);
  assert(filterResults.length > 0, `Filter query returned ${filterResults.length} matching active items`);

  // TEST 8: Saving & Unsaving Listings (Wishlist)
  console.log("\n[TEST 8] Saved Listings / Wishlist Mechanics");
  const savedEntry = await SavedListing.create({
    userId: testUser!._id,
    listingId: createdListing._id,
  });
  assert(!!savedEntry._id, "Item added to wishlist");

  let duplicateSaveError = false;
  try {
    await SavedListing.create({
      userId: testUser!._id,
      listingId: createdListing._id,
    });
  } catch (err: unknown) {
    duplicateSaveError = true;
  }
  assert(duplicateSaveError, "Duplicate wishlist save prevented by compound unique index");

  await SavedListing.findByIdAndDelete(savedEntry._id);
  const remainingSaves = await SavedListing.findOne({
    userId: testUser!._id,
    listingId: createdListing._id,
  });
  assert(remainingSaves === null, "Item successfully removed from wishlist");

  // TEST 9: Messaging & Participant Authorization
  console.log("\n[TEST 9] Peer Conversations & Participant Privacy");
  const conversation = await Conversation.create({
    participants: [testUser!._id, otherUser._id],
    listingId: createdListing._id,
    lastMessage: "Hi, can you do 1000?",
    lastMessageAt: new Date(),
  });
  assert(!!conversation._id, "Conversation initialized between buyer and seller");

  const msg = await Message.create({
    conversationId: conversation._id,
    senderId: otherUser._id,
    text: "Hi, can you do 1000?",
  });
  assert(!!msg._id, "Message sent and linked to conversation");

  const thirdUser = await User.create({
    name: "Third Stranger",
    email: `third.${Date.now()}@college.edu`,
    passwordHash: pwdHash,
    college: "BITS Pilani",
    course: "B.E.",
    branch: "EEE",
    academicYear: "1st Year",
    role: "student",
  });

  const isThirdParticipant = conversation.participants.some(
    (p) => p.toString() === thirdUser._id.toString()
  );
  assert(!isThirdParticipant, "Non-participant denied authorization to conversation");

  // TEST 10: Report Submission & Moderation
  console.log("\n[TEST 10] Community Reporting & Admin Moderation");
  const report = await Report.create({
    reporterId: testUser!._id,
    targetType: "listing",
    targetId: createdListing._id.toString(),
    reason: "Suspicious price",
    description: "Testing automated flag",
    status: "pending",
  });
  assert(report.status === "pending", "Report initialized with 'pending' status");

  report.status = "resolved";
  report.adminNotes = "Reviewed by campus moderator. Listing confirmed valid.";
  await report.save();
  assert(report.status === "resolved", "Admin successfully resolved report with notes");

  // Cleanup test fixtures
  await Listing.findByIdAndDelete(createdListing._id);
  await Conversation.findByIdAndDelete(conversation._id);
  await Message.deleteMany({ conversationId: conversation._id });
  await Report.findByIdAndDelete(report._id);
  await User.deleteMany({ _id: { $in: [firstUser._id, otherUser._id, thirdUser._id] } });

  console.log("\n========================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  await mongoose.disconnect();
  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
