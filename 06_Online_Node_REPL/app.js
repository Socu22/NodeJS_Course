import { log } from "console";
import express from "express";
import path from "path";

const app = express();

app.use(express.static("public"));
app.use(express.json);

// ===================== Pages ==============================

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/frontend/frontend.html"));
});

// ===================== API ==============================
app.post("/api/repl", (req, res) => {
  let replCode = req.body?.replCode;

  if (!replCode) {
    return res
      .status(400)
      .send({ errorMessage: "Missing the key replCode in the JSON body" });
  }

  replCode = replCode.replace('console.log("', "").replace('")', "");

  res.send({ data: replCode });
});
