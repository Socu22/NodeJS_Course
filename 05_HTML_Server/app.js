const expres = require("express");

const app = expres();

//app.use(expres.json)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/frontpage.html");
});

app.listen(8080, (error) => {
  if (error) {
    console.log("error is happening");
  }

  console.log("Server is running on port", 8080);
});
