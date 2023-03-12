import express from "express";
import {Express} from "express";
import passport from "passport";
import passportHttp from "passport-http";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import permission from "./permission";
import register from "./register";
import check from "./check";


const app: Express = express();

app.use(cors());

const port: number = parseInt(process.env.PORT!);
    
const secret: NodeJS.ProcessEnv = process.env!;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
passport.use(new passportHttp.BasicStrategy(
    function(username, password, done) {
      if (username === secret.per_page_user && password == secret.per_page_pass) {
        return done(null, true);
      } else {
        return done(null, false);
      }
    }
  ));


app.set("trust proxy", true);

let req_for_type: any;
let res_for_type: any;


//申請ページをレンダリング
app.get("/", (req, res) => {


  
  res.render("index.ejs");

  req_for_type = req;
  res_for_type = res;

    

});

app.get("/form", (req, res) => {
  res.render("form.ejs");
})


app.post("/register", register);

app.get(secret.per_path!, passport.authenticate("basic", {session: false}), permission);

app.post("/check", check);

app.get("/static/:filename", (req, res): void => {
  try {
        res.sendFile(path.join(__dirname, "../public/" + req.params.filename));
  } catch (e) {
        res.sendStatus(404).end();
  }
});


app.use((err: any, req: any, res: any, next: unknown) => {
    console.log(err);
  res.sendStatus(500).end();
})

export type TYPE_REQ = typeof req_for_type;
export type TYPE_RES = typeof res_for_type;

app.listen(port, () => console.log("server is running on " + port.toString()));
