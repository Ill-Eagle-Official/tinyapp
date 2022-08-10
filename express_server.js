// DEPENDENCIES

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser');

// HELPER FUNCTION FOR URL SHORTENING

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// MIDDLEWARE

app.use(express.urlencoded({ extended: true }));
app.use(cookie());

// REQUESTS/POSTS, TO BE SPECIFIED

//New URL page

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Renders individual URL pages based on ID

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username'] 
  };
  res.render('urls_show', templateVars);
});

// For creating new shortURLs with randomly generated strings

app.post("/urls", (req, res) => {
  console.log(req.body);
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
    username: req.cookies['username'],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
