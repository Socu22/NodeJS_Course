const replCodeOutputDiv = document.getElementById("repl-code-output");
const replInputInput = document.getElementById("repl-input");

replInputInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    console.log("keyup");
    runReplInput();
  }
});

function runReplInput() {
  const replCode2 = replInputInput.value;
  //replInputInput = "";
  addInput(replCode2);
  if (!replInputInput.value) {
    return;
  }
  fetch("/api/repl", {
    method: "POST",
    body: JSON.stringify({ replCode: replInputInput.value /*replCode*/ }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(({ data }) => {
      if (data.error) {
        console.log(data.error);
        addError(data.error);
      } else {
        console.log(data.output, data.result);
        addOutputResult(data.output, data.result);
      }
      replInputInput.value = "";
    });
}

function addInput(replCode) {
  const replPromptDiv = document.createElement("div");
  replPromptDiv.textContent = `> ${replCode}`;
  replPromptDiv.classList.add("repl-code-prompt");

  replCodeOutputDiv.appendChild(replPromptDiv);
  scrollTOTheBottom();
}
function addError(error) {
  const replErrorDiv = document.createElement("div");
  replErrorDiv.textContent = error;
  replErrorDiv.classList.add("repl-code-error");

  replCodeOutputDiv.appendChild(replErrorDiv);
  scrollTOTheBottom();
}
function addOutputResult(output, result) {
  if (output) {
    const replOutputDiv = document.createElement("div");
    replOutputDiv.textContent = output;
    replOutputDiv.classList.add("repl-code-output");

    replCodeOutputDiv.appendChild(replOutputDiv);
  }
  const replResultDiv = document.createElement("div");
  replResultDiv.textContent = result;
  replResultDiv.classList.add("repl-code-result");

  replCodeOutputDiv.appendChild(replResultDiv);
  scrollTOTheBottom();
}

function scrollTOTheBottom() {
  replCodeOutputDiv.scrollTop = replCodeOutputDiv.scrollHeight;
}
