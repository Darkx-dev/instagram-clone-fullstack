const { stat, readdir, access, unlink, constants } = require("fs");
const path = require("path");

const readSubDirectories = (directory) => {
  readdir(directory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        if (stats.isDirectory()) {
          console.log(filePath);
          readSubDirectories(filePath); // Recursively read subdirectories
        }
      });
    });
  });
};

const deletePost = (postId, userId, pathToSearchIn) => {
    const postImagePath = path.join(pathToSearchIn, userId.toString(), 'posts', `${postId}.png`);

    access(postImagePath, constants.F_OK, (err) => {
        if (!err) {
            unlink(postImagePath, (err) => {
                if (err) {
                    console.error('Error deleting post image:', err);
                } else {
                    console.log('Post image deleted successfully.');
                }
            });
        } else {
            console.log('Post image not found.');
        }
    });
};

module.exports = { readSubDirectories, deletePost };
