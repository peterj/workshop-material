const express = require('express');
const router = express.Router();

const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);

const getFiles = async (folderName) =>
    await readdir(folderName);

router.get('/', async (req, res, next) => {
    const folderName = "my-secrets";
    // Update to your name
    const firstName = "Peter"
    // Read a value from environment variable:
    // process.env.FIRST_NAME_VARIABLE;

    let secrets = `Folder ${folderName} does not exist`;
    try {
        secrets = await getFiles(folderName);
    } catch (e) {
        console.log('err', e)
    }

    res.render('index', {
        name: firstName,
        environmentVars: process.env,
        files: secrets,
        hostname: process.env.HOSTNAME
    });
});

module.exports = router;