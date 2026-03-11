import express from "express";
import path from "path";

const app = express();

app.use(express.static("public"));
// app.use(express.json());

// ===================== Pages ==============================

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/pages/index/index.html"));
});
/* Node.js basics */
app.get("/nodejs-basics", (req, res) => {
  res.sendFile(path.resolve("public/pages/nodejs-basics/nodejs-basics.html"));
});

/* JavaScript core */
app.get("/javascript-core", (req, res) => {
  res.sendFile(
    path.resolve("public/pages/javascript-core/javascript-core.html"),
  );
});

/* Running Node projects */
app.get("/nodejs-projects", (req, res) => {
  res.sendFile(
    path.resolve("public/pages/nodejs-projects/nodejs-projects.html"),
  );
});

/* Express REST + modules */
app.get("/express-rest-modules", (req, res) => {
  res.sendFile(
    path.resolve("public/pages/express-rest-modules/express-rest-modules.html"),
  );
});

/* Frontend security + tools */
app.get("/frontend-security-tools", (req, res) => {
  res.sendFile(
    path.resolve(
      "public/pages/frontend-security-tools/frontend-security-tools.html",
    ),
  );
});

app.get("/about", (req, res) => {
  res.sendFile(path.resolve("public/pages/about/about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.resolve("public/pages/contact/contact.html"));
});

// ===================== API ==============================

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log("Server started on port", server.address().port);
});
