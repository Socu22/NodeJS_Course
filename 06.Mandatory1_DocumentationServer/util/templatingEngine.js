import fs from 'fs';


export function constructPage(page, options = {}) {
    const header = readPage('./public/components/header/header.html');
    const footer = readPage('./public/components/footer/footer.html');

    return header
            .replace('$$DOCUMENT_TITLE$$', options.documentTitle || 'unnamed site')
            .replace('$$CSS_LINKS$$', options.cssLinks || '')
         + page 
         + footer;
}

export function readPage(path) {
    return fs.readFileSync(path).toString();
}
