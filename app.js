require("dotenv").config();
const { connectDB } = require("./config/database");
const User = require("./model/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const auth = require("./middleware/auth");
const cors = require('cors');

connectDB();

app.use(express.json());

app.use(cors())

// Register. My register logic
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, repeatPassword } = req.body; //I'm getting the user input
    if (!(email && password && firstName && lastName)) {
      //I'm validating user input
      res.status(400).send("All input is required");
    }
    //check and validate if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User Already Exist. Please Login"); //At this point, the register route should take that user to the login page in the front.
    }

    //check if passwords match
    if(password !== repeatPassword) {
      res.status(400).send("Password mismatch")
    }

    //encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    //create user in our database
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
      repeatPassword: password
    });

    //create user token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );

    //return new user
    res.status(201).json({ token, firstName, lastName, email });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Sorry an error occurred" });
  }
});

// Login. My Login logic
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; //Get the user input   
    if (!(email && password)) {
      //username or password
      //Validat the user input
      res.status(400).send("All input is required");
    }
    //Validate if user already exist in the database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //I created a user token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      const { first_name: firstName, last_name: lastName } = user;

      // the user
      res.status(200).json({ token, firstName, lastName, email });
    } else {
        res.status(400).send("Invalid Credentails");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Sorry an error occurred" });
  }
});

app.post("/welcome", auth, (_req, res) => {
  res.status(200).send("Welcome here!");
});

module.exports = app;
