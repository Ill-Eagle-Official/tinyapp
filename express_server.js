// DEPENDENCIES

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser');
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');

//
// VARIABLES
//

const {
    generateRandomString,
    getUserByEmail,
    urlsForUser,
} = require('./helpers');

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  ism5xK: {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

const users = {};

//
// MIDDLEWARE
//

app.use(express.urlencoded({ extended: true }));
app.use(cookie());

//
// REQUESTS/POSTS, TO BE SPECIFIED
//

//New URL page

app.get("/urls/new", (req, res) => {
  const cookie = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id]
  };

  if (!cookie) {
    return res.redirect('/login');
  };

  res.render("urls_new", templateVars);
});

// Account Registration Page

app.get("/register", (req, res) => {
  const cookie = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id]
  };

  if (cookie) {
    return res.redirect("/urls");
  };

  res.render("urls_registration", templateVars);
});

// Login Page

app.get('/login', (req, res) => {
  const cookie = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id]
  };

  if (cookie) {
    return res.redirect('/urls'); 
  };

  res.render('urls_login', templateVars);
});

//Renders individual URL pages based on ID

app.get("/urls/:id", (req, res) => {
  const cookie = req.cookies.user_id;
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id]
  };

  if (!cookie) {
    return res.status(403).send('<h1><b>403: You need to be logged in to see this!</b></h1>');
  }

  if ((urlDatabase[req.params.id].userID !== cookie)) {
    return res.status(403).send('<h1><b>403: YOU SHALL NOT PASS!</b></h1>');
  }
  res.render('urls_show', templateVars);
});

// For creating new shortURLs with randomly generated strings

app.post("/urls", (req, res) => {
  const shorterURL = generateRandomString();
  const cookie = req.cookies.user_id;

  if (!cookie) {
    return res.status(403).send('You need to be logged in to shorten URLs!');
  };

  urlDatabase[shorterURL] = {
    longURL: req.body.longURL,
    userID: cookie,
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shorterURL}`);
});

// Redirects to the longURL associated with the shortURL(id)

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.status(404).send('URL not found!');
  }

  res.redirect(longURL);
});

// Deletes a short URL and redirects to the main page

app.post("/urls/:id/delete", (req, res) => {
  const cookie = req.cookies.user_id;
  const shorterURL = req.params.id;

  if (!cookie) {
    return res.status(403).send('<h1><b>403: You need to be logged in to delete URLs!</b></h1>');
  };

  if ((urlDatabase[shorterURL].userID !== cookie)) {
    return res.status(403).send('<h1><b>403: YOU SHALL NOT PASS!</b></h1>');
  };

  delete urlDatabase[req.params.id].longURL;
  res.redirect('/urls');
});

// Adds a new user to the global USERS object through Registration

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const username = req.body.username;
  const randomUserID = generateRandomString();

  if(email === "" || password === "" || username === "") { // for blank fields
    return res.status(400).send("No fields can be blank, please fill 'em up!");
  };

  if(getUserByEmail(email, users)) { // for duplicate emails
    return res.status(400).send("This email is already in the system! Try another one!");
  };

  users[randomUserID] = {
    id: randomUserID,
    username: username,
    email: email,
    password: hashedPassword,
  };
  res.cookie('user_id', randomUserID);
  console.log(users);
  res.redirect('/urls');
})

// Redirects to edit page for a specific short URL determined by button press

app.get("/urls/:id/edit", (req, res) => {
  const shorterURL = req.params.id;
  res.redirect(`/urls/${shorterURL}`);
});

// Allows editing of long URL, then updates and redirects back to the main page

app.post("/urls/:id/", (req, res) => {
  const cookie = req.cookies.user_id;
  const shorterURL = req.params.id;
  const updatedURL = req.body.updatedURL;

  if(!cookie) {
    return res.status(403).send('<h1><b>403: You need to be logged in to edit URLs!</b></h1>');
  };

  if(urlDatabase[shorterURL].userID !== cookie) {
    return res.status(403).send('<h1><b>403: Sorry, not your URL!</b></h1>');
  };

  urlDatabase[shorterURL].longURL = updatedURL;
  res.redirect('/urls');
});

// Renders the base page with the list of urls

app.get("/urls", (req, res) => {
  const cookie = req.cookies.user_id;
  const user = users[req.cookies.user_id];
  const userURLs = urlsForUser(cookie, urlDatabase);
  const templateVars = { 
    user: user,
    urls: userURLs };

  if (!cookie) {
    return res.status(400).send('You need to login in order to see your URLs!');
  }

  res.render("urls_index", templateVars);
});

// Logs the user in, compares password and email values, creates a cookie, then redirects to the main page
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const registeredPassword = req.body.password;

  if(user === undefined) { // for email not found
    return res.status(403).send("403: Sorry! That email doesn't exist in our system!");
  };

  if(!bcrypt.compareSync(registeredPassword, user.password)) { // for an incorrect password
    return res.status(403).send("403: Sorry! That password is invalid, try again!");
  }; 

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// Logs the user out, deletes their cookie, then redirects to the main page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
