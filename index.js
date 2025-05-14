const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const app = express();

mongoose.connect('mongodb://localhost:27017/interviewApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set('trust proxy', 1);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60  // 1 hour
  }
}));

app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const count = await User.countDocuments();
        const user = req.session.user;
        res.render('home', { user, count });
    } catch (error) {
        res.status(500).send("Interval Server Error: ",error.message);
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.use(authRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
