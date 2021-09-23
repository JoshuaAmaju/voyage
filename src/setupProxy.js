const { join, basename } = require("path");

module.exports = (app) => {
  app.use((req, res, next) => {
    const { url } = req;

    if (url.includes("ffmpeg")) {
      const filename = basename(url);

      res.sendFile(
        join(__dirname, '..', "node_modules", "@ffmpeg", "core", "dist", filename)
      );
    } else {
      next();
    }
  });

  app.use((_, res, next) => {
    res.set({
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    });

    next();
  });
};
