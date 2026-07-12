import mongoose, { Schema, models, model } from "mongoose";

const SeoSchema = new Schema({
  title: String,
  description: String,
  keywords: String,
  canonical: String,
  ogTitle: String,
  ogImage: String,
  noIndex: { type: Boolean, default: false },
  jsonLd: String,
}, { _id: false });

const PageSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  sourceFile: String,
  title: { type: String, required: true },
  html: { type: String, required: true },
  headHtml: String,
  customCss: String,
  customJs: String,
  published: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  seo: { type: SeoSchema, default: () => ({}) },
}, { timestamps: true });

const SettingSchema = new Schema({
  key: { type: String, unique: true, required: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  active: { type: Boolean, default: true },
  lastLoginAt: Date,
}, { timestamps: true });

const EnquirySchema = new Schema({
  pageSlug: String,
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  data: Schema.Types.Mixed,
  status: { type: String, enum: ["new", "read", "closed"], default: "new" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const ActivitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  type: { type: String, default: "page_view" },
  pageSlug: String,
  path: String,
  meta: Schema.Types.Mixed,
}, { timestamps: true });

const MediaSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  alt: String,
  type: { type: String, default: "image" },
  mimeType: String,
  sizeBytes: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Page = models.Page || model("Page", PageSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);
export const User = models.User || model("User", UserSchema);
export const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);
export const Activity = models.Activity || model("Activity", ActivitySchema);
export const Media = models.Media || model("Media", MediaSchema);
