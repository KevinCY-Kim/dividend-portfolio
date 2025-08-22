import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  nickname: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.statics.register = async function(email, password, nickname) {
  if (!validator.isEmail(email)) throw new Error("Invalid email");
  const hash = await bcrypt.hash(password, 10);
  return this.create({ email, passwordHash: hash, nickname });
};

UserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", UserSchema);
