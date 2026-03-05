import express from "express";
import path from "path";

const app = express();

app.use(express.static("public"));
app.use(express.json());

// ===================== Pages ==============================

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/pages/frontend/frontend.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.resolve("public/pages/about/about.html"));
});

// ===================== API ==============================
import {
  getOrCreateSandboxContext,
  executeCodeInSandbox,
} from "./util/replUtil.js";

app.post("/api/repl", (req, res) => {
  if (!req.body) {
    return res.status(400).send({ errorMessage: "Missing a JSON body" });
  }
  //let replCode = req.body?.replCode;

  const { replCode, sandboxId } = req.body;

  if (!replCode) {
    return res
      .status(400)
      .send({ errorMessage: "Missing the key replCode in the JSON body" });
  }

  const sandbox = getOrCreateSandboxContext(sandboxId);

  const { error, success, output, result } = executeCodeInSandbox(
    sandbox,
    replCode,
  );

  if (error) {
    return res
      .status(500)
      .send({
        data: { error },
        errorMessage: "Error executing the provided code",
      });
  }

  res.send({ data: { success, output, result } });
});

//console.log(process.env.PORT); // PORT=9090 node app.js  ? $env:PORT=9090 node app.js? find this
// use cross-env instead as a wrapper. as port assgiemnt works different in different terminals

const PORT = process.env.PORT || 8080; // This instead of config inline.
const server = app.listen(PORT, () => {
  // app.listen send something back at once to server
  //console.log("Server started on port", server.address().port);
  console.log("Server started on port", server.address().port); // which is used here to make it work. port is part of the adress() to get the port.
});
