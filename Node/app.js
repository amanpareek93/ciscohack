const jsxapi = require('jsxapi');

var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

  // todoList Routes
  app.route('/bookMeeting')
    .get(bookMeeting)
    .post(bookMeeting);

/*
  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);
*/

app.listen(port);

function bookMeeting(req, res) {
    res.json({ body: "meeting booked" } );
}

// Connect over ssh to a codec
const xapi = jsxapi.connect('ssh://192.168.1.223', {
  username: 'oraclehack',
  password: 'oraclehack',
});

// Handle errors
xapi.on('error', (err) => {
  // !! Note of caution: This event might fire more than once !!
  console.error(`xapi error: ${err}`);
});



xapi.on('ready', () => {
    console.log("connexion successful");

    xapi.status
    .get('UserInterface Message TextInput Response')
    .then((response) => {
        console.log("Response:");
        console.log(response);
        xapi.feedback.on('/UserInterface/Message/TextInput/Response', (count) => {
            console.log(`Updated count to: ${count}`);
        });
    });

    // Fetch current count
    xapi.status
        .get('RoomAnalytics PeopleCount')
        .then((count) => {
            console.log(`Initial count is: ${count.Current}`);

            // Listen to events
            console.log('Adding feedback listener to: RoomAnalytics PeopleCount');
            xapi.feedback.on('/Status/RoomAnalytics/PeopleCount', (count) => {
                console.log(`Updated count to: ${count.Current}`);
            });

        })
        .catch((err) => {
            console.log(`Failed to fetch PeopleCount, err: ${err.message}`);
            console.log(`Are you interacting with a RoomKit? exiting...`);
            xapi.close();
        });
});


//xapi.command("UserInterface Message TextLine Display", { Text: "Do you want to extend the meeting?",  Duration:10, X:10, Y:10 });

xapi.command("UserInterface Message TextInput Display", { Text: "Do you want to extend the meeting?" });

/*
// Fetch volume and print it
xapi.status
  .get('Audio Volume')
  .then((volume) => { console.log(volume); });*/
/*
// Set up a call
xapi.command('Dial', { Number: 'tomas.nielsen@certus.com.hk' });


// Set a configuration
xapi.config.set('SystemUnit Name', 'My System');
*/
// Listen to feedback
const off = xapi.event.on('Standby', (event) => {
  console.log(event);
});

// De-register feedback
off();