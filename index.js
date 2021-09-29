'use strict';

const fs = require('fs');

const uploadsDir = '/tmp/api/uploads';
const imageDir = '/var/tmp/api/public/images';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
