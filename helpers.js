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

const getUserByEmail = function(email, library) {
  for (users in library) {
    if (library[users].email === email) {
      return library[users];
    }
  }
  return null;
};

module.exports = { generateRandomString, getUserByEmail };