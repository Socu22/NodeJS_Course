import { readPage, constructPage } from "./templatingEngine.js";


const frontpage = readPage('./public/pages/frontend/frontend.html');
export const frontpagePage = constructPage(frontpage, {
    cssLinks: '<link rel="stylesheet" href="/pages/frontend/frontend.css">'
});

const about = readPage('./public/pages/about/about.html');
export const aboutPage = constructPage(about, {
   documentTitle: 'Online Node.js REPL | About'
});


