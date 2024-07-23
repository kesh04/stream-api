import express from "express";
import dotenv from "dotenv";
import { genSaltSync, hashSync } from "bcrypt";
import { StreamChat } from "stream-chat";

dotenv.config();

const { PORT, STREAM_API_KEY, STREAM_API_SECRET } = process.env;
const client = StreamChat.getInstance(STREAM_API_KEY!, STREAM_API_SECRET);

const app = express();
app.use(express.json());
const salt = genSaltSync(10);

interface User {
  id: string;
  email: string;
  hashed_password: string;
}

const USERS: User[] = [];

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "password and email are requried",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "password must be at least  6 ",
    });
  }

  const exitingUser = USERS.find((user) => user.email === email);

  if (exitingUser) {
    return res.status(400).json({
      message: "user alredy ",
    });
  }

  try {
    const hashed_password = hashSync(password, salt);
    const id = Math.random().toString(36).slice(2);
    console.log("id", id);

    const newUser = {
      id,
      email,
      hashed_password,
    };
    USERS.push(newUser);

    await client.upsertUser({
      id,
      email,
      name: email,
    });

    const token  = client.createToken(id)

return res.status(200).json({
    token,
    user:{
        id,email
    }
})

  } catch (err) {
    res.status(500).json({ error: "user alredy" });
  }
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user =USERS.find((user) => user.email === email);
    const hashed_password = hashSync(password, salt);

    if(!user || user.hashed_password !== hashed_password){
        return res.status(400).json({
            message: "invalid ",
          });
        
 }

 const token  = client.createToken(user.id)

 return res.status(200).json({
    token,
    user:{
        id:user.id,
        email:user.email
    }
})

});


app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
