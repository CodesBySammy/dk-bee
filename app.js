require("dotenv").config();
const express = require("express");
const AWS = require('aws-sdk');
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs
const cors = require('cors'); // Import CORS package

const app = express();

// Configure DynamoDB
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// CORS configuration
app.use(cors({
    origin: 'http://13.200.229.146', // Replace with the domain of your frontend
    methods: ['GET', 'POST'], // Allow only specific HTTP methods
    credentials: true, // Allow credentials like cookies, sessions, etc.
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies

// Session and cookie middleware with expiration time
app.use(cookieParser());
app.use(session({
    secret: "your_secret_key", // Change this to a secret key for session encryption
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set secure to true if using HTTPS
        maxAge: 10 * 60 * 1000 // 10 minutes in milliseconds
    }
}));

const PORT = process.env.PORT || 8080;
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to insert data into a specified DynamoDB table
async function insertIntoDynamo(tableName, data) {
    const params = {
        TableName: tableName,
        Item: data
    };

    try {
        await dynamoDb.put(params).promise();
        console.log(`Data inserted into ${tableName} table successfully.`);
    } catch (err) {
        console.error(`Error inserting data into ${tableName} table:`, err);
    }
}

// Route to handle POST requests for submitting emails
app.post("/submitEmail", async function(req, res) {
    const { email } = req.body;

    try {
        const emailData = {
            emailid: uuidv4(), // Partition key for Emails table
            email // Email field
        };
        await insertIntoDynamo("Emails", emailData); // Insert into Emails table
        res.redirect("/about");
    } catch (err) {
        console.error("Error inserting email into 'Emails' table:", err);
        res.status(500).send("Error submitting email.");
    }
});

// Route to handle POST requests for submitting questions
app.post("/submitQuestion", async function(req, res) {
    const { question } = req.body;

    try {
        const questionData = {
            questionid: uuidv4(), // Partition key for Questions table
            question // The question being submitted
        };
        await insertIntoDynamo("Questions", questionData); // Insert into Questions table
        res.redirect("/nn.html");
    } catch (err) {
        console.error("Error inserting question into 'Questions' table:", err);
        res.status(500).send("Error submitting question.");
    }
});

// Route to handle POST requests for submitting answers
app.post("/submitAnswer", async function(req, res) {
    const { answer } = req.body;

    try {
        const answerData = {
            answerid: uuidv4(), // Partition key for Answers table
            answer // The answer being submitted
        };
        await insertIntoDynamo("Answers", answerData); // Insert into Answers table
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting answer into 'Answers' table:", err);
        res.status(500).send("Error submitting answer.");
    }
});

// Route to handle POST requests for submitting queries
app.post("/submitQuery", async function(req, res) {
    const { name, email, query } = req.body;

    try {
        const queryData = {
            queryid: uuidv4(), // Partition key for Queries table
            name, // Name of the person submitting the query
            email, // Email of the person submitting the query
            query // The query being submitted
        };
        await insertIntoDynamo("Queries", queryData); // Insert into Queries table
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting query into 'Queries' table:", err);
        res.status(500).send("Error submitting query.");
    }
});

// Route to handle requests for "/another_page.html"
app.get("/another_page.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'another_page.html'));
});

// Route to handle requests for "/"
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle requests for "/nn.html"
app.get("/nn.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'nn.html'));
});

// Route to handle requests for "/about"
app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "hom.html"));
});

// Route to handle requests for "/answers.html"
app.get("/answers.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'answers.html'));
});

// Route to handle requests for "/contact.html"
app.get("/contact.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Start the server
app.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
