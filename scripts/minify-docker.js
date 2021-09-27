/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { nodeFileTrace } = require('@vercel/nft');
const files = ['bin/www', 'app.js'];
const resultFolder = 'app-minimal';

(async () => {
    console.log('Start analyizing...');
    const { fileList } = await nodeFileTrace(files, {
        base: path.resolve(path.join(__dirname, '..')),
        ignore: ['./node_modules/transformers/node_modules/uglify-js/tools/exports.js']
    });
    console.log('Total files need to be copy: ' + fileList.length);
    return Promise.all(fileList.map((e) => fs.copy(e, path.resolve(path.join(resultFolder, e)))));
})();