const express = require('express');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');

const app = express();
const port = process.env.PORT || 8080;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

function parseLine(line) {
    const numbers = line.split(' ');
    let result = 0;

    numbers.forEach(num => {
        const intNum = parseInt(num, 10);
        if (!isNaN(intNum)) {
            result += intNum;
        }
    });

    return result.toString();
}

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileStream = fs.createReadStream(req.file.path);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let result = '';

    rl.on('line', (line) => {
        result += parseLine(line) + ' ';
    });

    rl.on('close', () => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.send(result.trim());

        // Remove the file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error removing the file:', err);
            }
        });
    });

    rl.on('error', (err) => {
        console.error('Error reading the file:', err);
        res.status(500).send('Error processing file');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
