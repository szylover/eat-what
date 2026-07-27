const tasteProfile = require("../shared/taste-profile.json");

module.exports = async function (context) {
  context.res = {
    status: 200,
    headers: { "Cache-Control": "public, max-age=3600" },
    body: tasteProfile,
  };
};
