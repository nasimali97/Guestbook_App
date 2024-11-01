var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();
var port = process.env.PORT || 3000;

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true })); // Middleware to handle form submissions
app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files (if needed)
app.use(express.static('public'));

// Route for the homepage
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the guestbook page
app.get('/guestbook', function (req, res) {
    res.sendFile(path.join(__dirname, 'guestbook.html'));
});

// Route to get guestbook data
app.get('/guestbook-data', function (req, res) {
    fs.readFile(path.join(__dirname, 'guestbook.json'), 'utf8', function (err, data) {
        if (err) {
            return res.status(500).send('Error reading JSON file.');
        }
        res.json(JSON.parse(data));
    });
});

// Route for new message
app.get('/newmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'new_message.html')); // Ensure this matches the file name
});

// Route for AJAX message page
app.get('/ajaxmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'ajax_message.html')); // Serve the new AJAX message page
});

// Handle form submissions from the new message page
app.post('/newmessage', (req, res) => {
    const { username, country, message } = req.body;

    // Validate the input fields
    if (!username || !country || !message) {
        return res.status(400).send('All fields are required.'); // Respond with an error if any field is empty
    }

    // Function to format date to the desired format
    function formatDate(date) {
        return date.toString(); // Convert date to string, which uses the default format
    }

    // Create a new message object with the formatted date
    const newMessage = {
        username,
        country,
        date: formatDate(new Date()), // Use the formatDate function
        message,
    };

    // Read the existing guestbook data
    fs.readFile(path.join(__dirname, 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading JSON file.');
        }

        let messages = [];
        try {
            messages = JSON.parse(data); // Parse existing messages
        } catch (parseError) {
            return res.status(500).send('Error parsing JSON file.');
        }

        // Add the new message to the messages array
        messages.push(newMessage);

        // Write the updated messages array back to the JSON file
        fs.writeFile(path.join(__dirname, 'guestbook.json'), JSON.stringify(messages, null, 2), (writeError) => {
            if (writeError) {
                return res.status(500).send('Error writing to JSON file.');
            }
            // Redirect to the guestbook after submission
            res.redirect('/guestbook');
        });
    });
});

// Handle AJAX form submissions
app.post('/ajaxmessage', (req, res) => {
    const { username, country, message } = req.body;

    // Validate the input fields
    if (!username || !country || !message) {
        return res.status(400).send('All fields are required.'); // Respond with an error if any field is empty
    }

    // Create a new message object
    const newMessage = {
        username,
        country,
        date: new Date().toString(), // Get the current date
        message,
    };

    // Respond with the new message as JSON
    res.json([newMessage]); // Wrap in an array to maintain consistency with your current AJAX handling
});

// Start the server
app.listen(port, function () {
    console.log('Server running at http://localhost:' + port);
});
