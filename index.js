const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // For token generation
const cors = require('cors');
const RegisterModel = require('./models/NewUser');
const FinanceModel = require('./models/FinanceSe');
const MemberModel = require('./models/MemberModel');
const ShortloanModel = require('./models/ShortloanModel');
const LongloanModel = require('./models/LongloanModel');
const MonthlyDataModel = require('./models/MonthlyDataModel');
const AdminModel = require('./models/Admin');

const app = express();
app.use(express.json()); // Ensure this line is in your server setup
``
// Enable CORS with specific origins
app.use(cors({
    origin: [
        'http://localhost:5173',  // Local development URL
        'https://mybankgk.netlify.app'  // Production frontend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS in methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // If you're using cookies or other credentials
}));

// Handle preflight requests (CORS preflight checks)
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins or specify if needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://gururajk:guru123@cluster0.4uu67a5.mongodb.net/mybank', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error('Database connection error:', error));
db.once('open', () => console.log('Database connected'));

// Secret key for JWT
const SECRET_KEY = 'mySuperSecretKey'; // Replace with environment variable in production

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    // Check for hardcoded superadmin token
    if (token === 'hardcodedSuperAdminToken') {
        req.user = { role: 'superadmin' }; // Simulate superadmin role
        return next();
    }

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.sendStatus(403); // Forbidden
        }
    };
};

// Routes

// Registration Route
// app.post('/createRegister', async (req, res) => {
//     const { email, password, role } = req.body; // Capture the role from the request body
//     try {
//         const newUser = await RegisterModel.create({
//             ...req.body, // Spread other fields (fname, lname, mobile)
//             role: role || 'user' // Default to 'user' if no role provided
//         });
//         res.status(201).json(newUser);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for the user in the admin collection
        let user = await AdminModel.findOne({ email });

        // If not found, check in the regular users collection
        if (!user) {
            user = await MemberModel.findOne({ username: email });
        }
        if (user) {
            // Here you would typically hash the password and compare
            if (user.password === password) {
                const token = jwt.sign({ id: user._id, email: user.email || user.username, role: user.role, memberno: user.memberno }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login successful', token, role: user.role });
            } else {
                return res.status(401).json({ message: 'Password is incorrect' });
            }
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Create Admin (protected)
app.post('/createAdmin', authenticateJWT, async (req, res) => {
    try {
        const adminData = req.body;

        // Optional: Validate the incoming admin data
        if (!adminData.email || !adminData.password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if the admin already exists
        const existingAdmin = await AdminModel.findOne({ email: adminData.email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Create the admin in the database
        const newAdmin = await AdminModel.create(adminData);
        res.status(201).json(newAdmin); // Return the created admin
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ error: err.message }); // Return server error
    }
});

app.get('/admins', authenticateJWT, (req, res) => {
    AdminModel.find()
        .then(admins => res.json(admins))
        .catch(err => res.status(500).json({ error: err.message }));
});


// Finance Settings (protected)
app.post('/financeSetting', authenticateJWT, (req, res) => {
    FinanceModel.create(req.body)
        .then(finances => res.json(finances))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/financeSetting', authenticateJWT, (req, res) => {
    FinanceModel.find()
        .then(finances => res.json(finances))
        .catch(err => res.status(500).json({ error: err.message }));
});


// New Member (protected)
app.post('/newMember', authenticateJWT, async (req, res) => {
    try {
        const { memberno, fullname, tsamount, msamount, username, password, role } = req.body;

        // Validate the required fields
        if (!memberno || !fullname || !username || !password) {
            return res.status(400).json({ message: 'Member number, fullname, username, and password are required.' });
        }

        // Create the new member
        const newMember = new MemberModel({
            memberno,
            fullname,
            tsamount,
            msamount,
            username,
            password, // Consider hashing the password before saving
            role: role || 'user'
        });

        // Save the member to the database
        const savedMember = await newMember.save();

        // Log the created member object
        console.log("New member created:", savedMember);

        // Return the created member
        res.status(201).json(savedMember);
    } catch (err) {
        console.error("Error creating member:", err); // Log any errors encountered
        res.status(500).json({ error: err.message }); // Return server error
    }
});

// // Allmember Route
app.get('/allMember', authenticateJWT, checkRole(['admin', 'superadmin']), (req, res) => {
    MemberModel.find() // This will return all users in the members collection
        .then(members => res.json(members))
        .catch(err => res.status(500).json({ error: err.message }));
});



// NewMember Route
app.get('/newMember', authenticateJWT, async (req, res) => {
    try {
        const memberno = req.user.memberno; // Extract memberno from token payload
        console.log("Member number extracted:", memberno); // Log the member number
        const user = await MemberModel.findOne({ memberno }); // Find the user by member number

        if (user) {
            console.log("User found:", user); // Log the found user data
            res.json(user); // Return only the logged-in user's data
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user data:", error); // Log any errors encountered
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Send Short Loan Data (protected)
app.post('/shortloan', authenticateJWT, (req, res) => {
    ShortloanModel.create(req.body)
        .then(shortloans => res.json(shortloans))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Fetch Short Loan Data 
app.get('/shortloan', authenticateJWT, (req, res) => {
    ShortloanModel.find()
        .then(shortloans => res.json(shortloans))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Send Long Loan Data (protected)
app.post('/longloan', authenticateJWT, (req, res) => {
    LongloanModel.create(req.body)
        .then(longloans => res.json(longloans))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Fetch Long Loan Data (protected)
app.get('/longloan', authenticateJWT, (req, res) => {
    LongloanModel.find()
        .then(longloans => res.json(longloans))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Monthly Data (protected)
// app.post('/monthlydata', authenticateJWT, (req, res) => {
//     const { memberno } = req.body;

//     // Find by memberno and update or create if it doesn't exist
//     MonthlyDataModel.findOneAndUpdate(
//         { memberno }, // Find the document by memberno
//         { $set: req.body }, // Set new data fields
//         { upsert: true, new: true } // Options: create if not exist, return updated document
//     )
//         .then(updatedData => res.json(updatedData))
//         .catch(err => res.status(500).json({ error: err.message }));
// });

app.post('/monthlydata', authenticateJWT, async (req, res) => {
    const { memberno, cmonthYear } = req.body;

    try {
        // Check if there is already a record for the same memberno and cmonthYear
        const existingRecord = await MonthlyDataModel.findOne({memberno, cmonthYear });

        if (existingRecord) {
            // If a record with the same cmonthYear already exists, return an alert message
            return res.status(400).json({ message: 'Data for this month/year has already been saved.' });
        }

        // Set the base totalShareAmount to 6000 and add 1000 every time a new entry is saved
        const baseTotalShareAmount = 6000;
        const incrementAmount = 1000;

        // Calculate the new totalShareAmount
        const newTotalShareAmount = baseTotalShareAmount + incrementAmount * (await MonthlyDataModel.countDocuments({ memberno }));

        // Create a new record with the updated totalShareAmount
        const newRecord = new MonthlyDataModel({
            ...req.body, // Include all fields from the request body
            totalShareAmount: newTotalShareAmount, // Set the updated totalShareAmount
        });

        // Save the new record to the database
        const savedRecord = await newRecord.save();

        // Return the saved record as a response
        res.json(savedRecord);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// Fetch Monthly Data (protected)
app.get('/usermonthlydata', authenticateJWT, async (req, res) => {
    try {
        const memberno = req.user.memberno; // Extract memberno from token payload
        console.log("Member number extracted:", memberno); // Log the member number
        const user = await MonthlyDataModel.find({ memberno }); // Find the user by member number

        if (user) {
            console.log("User found:", user); // Log the found user data
            res.json(user); // Return only the logged-in user's data
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user data:", error); // Log any errors encountered
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Fetch Monthly Report (protected)
app.get('/monthlyReports', authenticateJWT, (req, res) => {
    MonthlyDataModel.find()
        .then(monthlydatas => res.json(monthlydatas))
        .catch(err => res.status(500).json({ error: err.message }));
});



// ------------------------------------------------------------------------------------------
// ===================================CROSS CHECK AND DELETE=================================

// app.get('/monthlydata/latest/:memberno', async (req, res) => {
//     const { memberno } = req.params;

//     try {
//         // Fetch the latest entry for the given memberno, sorted by cmonthYear
//         const latestEntry = await MonthlyDataModel.find({ memberno })
//             .sort({ cmonthYear: -1 }) // Use cmonthYear in sorting
//             .limit(1);
//         // Return the latest entry or null if not found
//         if (latestEntry.length > 0) {
//             console.log('Fetched latest totalShareAmount:', latestEntry[0].totalShareAmount);
//             res.json(latestEntry[0]);
//         } else {
//             res.json(null);
//         }
//     } catch (error) {
//         console.error('Error fetching latest entry:', error);
//         res.status(500).json({ message: 'Error fetching latest entry' });
//     }
// });




// Start Server
app.listen(3001, () => console.log('Server is running on port 3001'));