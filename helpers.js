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

// HELPER FUNCTION TO GET USER ID BY EMAIL

const getUserByEmail = function(email, library) {
  for (users in library) {
    if (library[users].email === email) {
      return library[users];
    }
  }
  return null;
};

// HELPER FUNCTION TO GET URLS BY USER ID

const urlsForUser = function(id, library) {
  let userURLs = {};

  for (let urls in library) {
    if (library[urls].userID === id) {
      userURLs[urls] = library[urls];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser }