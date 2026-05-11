const User = require("../models/userSchema");
const { z } = require("zod");
// ZOD shcema define
const signUpSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be minimum 6 charecters"),
  avatar: z.string().optional(),
  address: z.string().optional(),
});

const signUp = async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  try {
    //   Checking input data
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullname, email, password, avatar, address } = parsed.data;

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(409).json({ error: "user already exist" });

    const user = await User.create({
      fullname,
      email,
      password,
      avatar,
      address,
    });

    return res.status(201).json({
      message: "Sign Up successfull",
      user: {
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server Error" });
  }
};

const logIn = async (req, res) => {};

module.exports = { signUp, logIn };
