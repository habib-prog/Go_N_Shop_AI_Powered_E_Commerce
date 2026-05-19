const { z } = require("zod");
// ZOD shcema define
const signUpSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be minimum 6 charecters"),
  avatar: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be minimum 6 charecters"),
});

module.exports = { signUpSchema, loginSchema };
