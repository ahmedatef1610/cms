const path = require("path");
const fs = require("fs");
/*******************************************************************************/
module.exports = {
  uploadDir: path.join(__dirname, "../public/uploads/"),
  isEmpty: function (object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },
  deleteFile: function (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        //throw new Error(err);
      }
    });
  },
};
