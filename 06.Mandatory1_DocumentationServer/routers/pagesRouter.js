import { Router } from "express";

import {
  nodejsBasicsPage,
  javascriptCorePage,
  nodejsProjectsPage,
  expressRestModulesPage,
  frontendSecurityToolsPage,
  ssrcomponentsdeclutterPage,
  aboutPage,
  contactPage
} from "../util/pagesUtil.js";

const router = Router();

router.get("/", (req, res) => {
  res.send(nodejsBasicsPage);
});


/* Node.js basics */
router.get("/nodejs-basics", (req, res) => {
  res.send(nodejsBasicsPage);
});

/* JavaScript core */
router.get("/javascript-core", (req, res) => {
  res.send(javascriptCorePage);
});

/* Running Node projects */
router.get("/nodejs-projects", (req, res) => {
  res.send(nodejsProjectsPage);
});

/* Express REST + modules */
router.get("/express-rest-modules", (req, res) => {
  res.send(expressRestModulesPage);
});

/* Frontend security + tools */
router.get("/frontend-security-tools", (req, res) => {
  res.send(frontendSecurityToolsPage);
});

/* SSR + Components + Declutter */
router.get("/ssr-components-declutter", (req, res) => {
  res.send(ssrcomponentsdeclutterPage);
});

router.get("/about", (req, res) => {
  res.send(aboutPage);
});

router.get("/contact", (req, res) => {
  res.send(contactPage);
});

export default router;