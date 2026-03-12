import { Router } from "express";
import {
  getOrCreateSandboxContext,
  executeCodeInSandbox,
} from "../util/replUtil.js";

const router = Router();

router.get("/hello", (req, res) => {
  res.send({ data: "hello" });
});

router.post("/api/repl", (req, res) => {
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
    return res.status(500).send({
      data: { error },
      errorMessage: "Error executing the provided code",
    });
  }

  res.send({ data: { success, output, result } });
});

export default router;
