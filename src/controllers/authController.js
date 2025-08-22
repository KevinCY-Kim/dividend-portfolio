import User from "../models/User.js";

export async function getLogin(req,res){ res.render("login"); }
export async function getRegister(req,res){ res.render("register"); }

export async function postRegister(req,res){
  try{
    const { email, password, nickname } = req.body;
    const user = await User.register(email, password, nickname);
    req.session.userId = user._id.toString();
    res.redirect("/");
  }catch(e){
    res.status(400).send(e.message);
  }
}

export async function postLogin(req,res){
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("Invalid credentials");
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).send("Invalid credentials");
  req.session.userId = user._id.toString();
  res.redirect("/");
}

export function logout(req,res){
  req.session.destroy(()=> res.redirect("/"));
}
