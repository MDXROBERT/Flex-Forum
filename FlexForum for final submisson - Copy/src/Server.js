import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import session from 'express-session';
import MongoStore from 'connect-mongo';


const password = "MDX123";
const username = "iarinkarobert1904";
const server = "cluster0.fxiduz0.mongodb.net";

const connectionURI = `mongodb+srv://${username}:${password}@${server}/?retryWrites=true&w=majority`;
console.log(connectionURI);

// Create a new MongoClient
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to database successfully");

    } catch (error) {
        console.error("Could not connect to database", error);
        process.exit(1); // Exit the process with an error code
    }
}


connectToDatabase();

// Student ID path
const studentIdPath = '/M00862854';



// Create an Express application
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Enable All CORS Requests
app.use(cors());


app.use(session({
    secret: 'CST2120',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: `mongodb+srv://${username}:${password}@${server}/?retryWrites=true&w=majority` }),
    cookie: { maxAge: 3600000 } // Session expiration time in milliseconds (e.g., 1 hour)
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve index.html from the root path
app.get(studentIdPath, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
// Validate phone number format
function isValidPhoneNumber(phoneNumber) {
    const regex = /^\d{10}$/;
    return regex.test(phoneNumber);
}

// Register endpoint
app.post('/M00862854/register', async (req, res) => {
    console.log(req.body);

  
    const { username, email, password, phonenumber } = req.body;

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phonenumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });

    }

    try {
        // Connect to the database
        const usersCollection = client.db("DataBase").collection("User");

        // Check if user exists
        const user = await usersCollection.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
            phonenumber,
            followers: [],
        });

        req.session.user = { username, email };
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error registering new user", error: error.message });
    }
});

// Login endpoint
app.post('/M00862854/login', async (req, res) => {
    try {
        const { email, password, phoneNumber } = req.body;

        console.log("Attempting login with phone number:", phoneNumber);

        const usersCollection = client.db("DataBase").collection("User");

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(400).send("User does not exist");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send("Invalid password");

        req.session.user = {
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber
        };
        res.status(200).json({ message: "Logged in successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login error", error: error.message });
    }
});

// Get posts endpoint
app.get('/M00862854/getPosts', async (req, res) => {
    try {
        const currentUser = req.session.user ? req.session.user.username : null;
        if (!currentUser) {
            return res.status(401).send("Must be logged in to view posts.");
        }

        // Fetch the current user document to get the list of users they are following
        const currentUserDoc = await client.db("DataBase").collection("User")
            .findOne({ username: currentUser });

        const followingUsers = currentUserDoc.following || [];

        const postsCollection = client.db("DataBase").collection("posts");
        const posts = await postsCollection.find({
            $or: [
                { visibility: "public" },
                {
                    visibility: "private",
                    username: { $in: followingUsers }
                },
                { username: currentUser }
            ]
        }).sort({ createdAt: -1 }).toArray();

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Failed to fetch posts.");
    }
});

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: multer.memoryStorage() });


// Middleware to parse JSON bodies
app.use(express.json());


//POST Endpoint
app.post(`${studentIdPath}/postData`, (req, res) => {
    const receivedData = req.body;
    res.json({ message: "Data received", data: receivedData });
});

// File upload endpoint
app.post('/M00862854/uploadPhoto', upload.single('photo'), (req, res) => {
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ photoUrl: filePath });
    } else {
        res.status(400).send('No file uploaded.');
    }
});

// Get users endpoint
app.get('/M00862854/getUsers', async (req, res) => {
    try {

        const usersCollection = client.db("DataBase").collection("User");

        // Fetching all registered users from the database
        const registeredUsers = await usersCollection.find({}).toArray();

        res.json(registeredUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching users");
    }

});

// Get current user endpoint
app.get('/M00862854/currentUser', (req, res) => {
    console.log(req.session.user); 
    if (req.session.user) {
        res.json({
            isLoggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            isLoggedIn: false,
            user: null
        });
    }
});

// Logout endpoint
app.post('/M00862854/uploadPost', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { text, visibility } = req.body;

    // Validate visibility
    if (!['public', 'private'].includes(visibility)) {
        return res.status(400).send('Invalid visibility setting.');
    }

    try {
        const postsCollection = client.db("DataBase").collection("posts");

        const imageBase64 = Buffer.from(req.file.buffer).toString('base64');
        const newPost = {
            image: `data:${req.file.mimetype};base64,${imageBase64}`,
            createdAt: new Date(),
            username: req.session.user.username,
            text: text,
            visibility: visibility, // Store the visibility setting
        };

        await postsCollection.insertOne(newPost);
        res.status(201).send('Post uploaded successfully.');
    } catch (error) {
        console.error('Error uploading post:', error);
        res.status(500).send('Error uploading post.');
    }
});

// Like post endpoint
app.post('/M00862854/likePost', async (req, res) => {
    const { postId } = req.body;

    try {

        const postsCollection = client.db("DataBase").collection("posts");


        await postsCollection.updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: 1 } });

        res.send({ message: "Post liked successfully" });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).send('Error liking post.');
    }


});

//daily blog
app.post('/M00862854/postDailyBlog', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('User not logged in');
    }

    const { text } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {

        const blogsCollection = client.db("DataBase").collection("DailyBlog");

        // Check if the user has already posted today
        const existingPost = await blogsCollection.findOne({
            username: req.session.user.username,
            date: {
                $gte: today
            }
        });

        if (existingPost) {
            return res.status(400).send('Already posted a blog today.');
        }

        await blogsCollection.insertOne({
            username: req.session.user.username,
            text,
            date: new Date() // Current date and time
        });

        res.send('Blog posted successfully.');
    } catch (error) {
        console.error('Error posting daily blog:', error);
        res.status(500).send('Failed to post daily blog.');
    }
});

// Get daily blogs endpoint
app.get('/M00862854/getDailyBlogs', async (req, res) => {
    try {

        const blogsCollection = client.db("DataBase").collection("DailyBlog");

        const blogs = await blogsCollection.find().toArray();

        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching daily blogs:", error);
        res.status(500).send("Failed to fetch daily blogs.");
    }
});

//send message
app.post('/M00862854/sendMessage', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "You must be logged in to send messages." });
    }


    const { receiver, content } = req.body;
    const sender = req.session.user.username;

    try {
        const result = await client.db("DataBase").collection("messages").insertOne({
            sender,
            receiver,
            content,
            createdAt: new Date()
        });

        if (result.acknowledged) {
            res.status(201).json({ message: "Message sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send message" });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// Get messages endpoint
app.get('/M00862854/getMessages', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "You must be logged in to view messages." });
    }

    const currentUser = req.session.user.username;
    const { chatWith } = req.query;

    try {
        const messagesCollection = client.db("DataBase").collection("messages");
        // Fetch messages that are specifically between the currentUser and the chatWith user
        const messages = await messagesCollection.find({
            $or: [
                { $and: [{ sender: currentUser }, { receiver: chatWith }] },
                { $and: [{ sender: chatWith }, { receiver: currentUser }] }
            ]
        }).sort({ createdAt: 1 }).toArray(); // Sort by createdAt to get the messages in chronological order
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "An error occurred while fetching messages", error: error.message });
    }
});



// Follow user endpoint
app.post('/M00862854/followUser', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Must be logged in to follow users.");
    }

    const { usernameToFollow } = req.body;
    const currentUserUsername = req.session.user.username;

    if (usernameToFollow === currentUserUsername) {
        return res.status(400).send("You cannot follow yourself.");
    }

    try {
        // Add the followed user to the current user's 'following' array
        await client.db("DataBase").collection("User").updateOne(
            { username: currentUserUsername },
            { $addToSet: { following: usernameToFollow } }
        );

        res.status(200).send("Followed successfully.");
    } catch (error) {
        console.error("Error following user:", error);
        res.status(500).send("Failed to follow user.");
    }
});

//search
app.get('/M00862854/search', async (req, res) => {
    const { searchQuery } = req.query; // Getting the search query from URL parameters
    const currentUser = req.session.user ? req.session.user.username : null;

    try {
        const usersCollection = client.db("DataBase").collection("User");
        // Fetch the current user document to get the list of users they are following
        const currentUserDoc = await usersCollection.findOne({ username: currentUser });


        if (!currentUserDoc) {
            return res.status(404).json({ message: "Current user not found" });
        }

        const followingUsers = currentUserDoc.following || [];

        const searchedUser = await usersCollection.findOne({ username: searchQuery });
        if (!searchedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = followingUsers.includes(searchQuery);
        const postsCollection = client.db("DataBase").collection("posts");
        const posts = await postsCollection.find({
            username: searchQuery,
            $or: [
                { visibility: "public" },
                ...(isFollowing ? [{ visibility: "private" }] : [])
            ]
        }).toArray();

        res.json(posts);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "An error occurred during the search" });
    }
});

// Unfollow user endpoint
app.post('/M00862854/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.status(500).send('Could not log out, please try again.');
        }
        res.clearCookie('CST2120');
        return res.status(200).send('Logout successful.');
    });
});



// Start the server
const port = 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
