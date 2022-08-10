// DEPENDENCIES

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser');

app.set('view engine', 'ejs');

//
// VARIABLES
//

const {
    generateRandomString,
    getUserByEmail,
} = require('./helpers');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// Account Registration Page

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_registration", templateVars);
});

// Login Page

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_login', templateVars);
});

//Renders individual URL pages based on ID

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id]
  };
  res.render('urls_show', templateVars);
});

// For creating new shortURLs with randomly generated strings

app.post("/urls", (req, res) => {
  const shorterURL = generateRandomString();
  urlDatabase[shorterURL] = req.body.longURL;
  res.redirect(`/urls/${shorterURL}`);
});

// Redirects to the longURL associated with the shortURL(id)

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Deletes a short URL and redirects to the main page

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Adds a new user to the global USERS object through Registration

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
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
    password: password,
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
  const shorterURL = req.params.id;
  const updatedURL = req.body.updatedURL;
  urlDatabase[shorterURL] = updatedURL;
  res.redirect('/urls');
});

// Renders the base page with the list of urls

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies.user_id],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Logs the user in, compares password and email values, creates a cookie, then redirects to the main page
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const registeredPassword = req.body.password;

  if(user === undefined) { // for email not found
    return res.status(403).send("403: Sorry! That email doesn't exist in our system!");
  };

  if(user.password !== registeredPassword) { // for an incorrect password
    return res.status(403).send("403: Sorry! That password is invalid, try again!");
  }; 

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// Logs the user out, deletes their cookie, then redirects to the main page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
