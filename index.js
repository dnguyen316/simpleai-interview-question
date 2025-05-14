const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const app = express();

mongoose.connect('mongodb+srv://ngltduong:%40Dltn_15041998@cluster0.vwn71ur.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0', {
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
    secure: false,         // Replit is HTTPS, but iOS drops secure cookies unless `sameSite` is set
    httpOnly: true,
    sameSite: 'lax',        // <<< IMPORTANT: allows cookies across redirects/tabs
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
        res.status(500).send(error.message);
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
