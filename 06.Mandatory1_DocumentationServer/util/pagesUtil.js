import { readPage, constructPage } from "./templatingEngine.js";



/* Node.js Basics */
const nodejsBasics = readPage('./public/pages/nodejs-basics/nodejs-basics.html');
export const nodejsBasicsPage = constructPage(nodejsBasics, {
    cssLinks: '<link rel="stylesheet" href="/pages/nodejs-basics/nodejs-basics.css">',
    documentTitle: "Node.js Documentation | Node.js Basics"
});

/* JavaScript Core */
const javascriptCore = readPage('./public/pages/javascript-core/javascript-core.html');
export const javascriptCorePage = constructPage(javascriptCore, {
    cssLinks: '<link rel="stylesheet" href="/pages/javascript-core/javascript-core.css">',
    documentTitle: "Node.js Documentation | JavaScript Core"
});

/* Node Projects */
const nodejsProjects = readPage('./public/pages/nodejs-projects/nodejs-projects.html');
export const nodejsProjectsPage = constructPage(nodejsProjects, {
    cssLinks: '<link rel="stylesheet" href="/pages/nodejs-projects/nodejs-projects.css">',
    documentTitle: "Node.js Documentation | Node Projects"
});

/* Express REST + Modules */
const expressRestModules = readPage('./public/pages/express-rest-modules/express-rest-modules.html');
export const expressRestModulesPage = constructPage(expressRestModules, {
    cssLinks: '<link rel="stylesheet" href="/pages/express-rest-modules/express-rest-modules.css">',
    documentTitle: "Node.js Documentation | Express REST + Modules"
});

/* Frontend Security + Tools */
const frontendSecurityTools = readPage('./public/pages/frontend-security-tools/frontend-security-tools.html');
export const frontendSecurityToolsPage = constructPage(frontendSecurityTools, {
    cssLinks: '<link rel="stylesheet" href="/pages/frontend-security-tools/frontend-security-tools.css">',
    documentTitle: "Node.js Documentation | Security & Tools"
});

/* About */
const about = readPage('./public/pages/about/about.html');
export const aboutPage = constructPage(about, {
    documentTitle: "Node.js Documentation | About"
});

/* Contact */
const contact = readPage('./public/pages/contact/contact.html');
export const contactPage = constructPage(contact, {
    documentTitle: "Node.js Documentation | Contact"
});