const jsxapi = require('jsxapi');

var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');


// DDP connection to Evoko Home server

const DDPClient = require("ddp");
const sha256 = require('sha256');
const moment = require("moment-timezone");

const USERNAME = 'defaultDevIntegrationUser';
const PASSWORD = 'wjHjBa4SS7-qX0fTWaad8vPsSa9QJdQcKVE3q6LsG2v'; // secret token Hackaton machine
const URL = 'wss://192.168.1.191:3002/websocket';
const PASSWORDHASH = sha256(PASSWORD);

const ddpclient = new DDPClient({
  autoReconnect: true,
  autoReconnectTimer : 500,
  maintainCollections : true,
  ddpVersion : 1,
  url: URL
});
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // Accept self signed certificate (not for production!)


console.log("Connecting...");

/*
 * Connect to the Meteor Server
 */
ddpclient.connect(function(error, wasReconnect) {
    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-established
    if (error) {
      console.log('DDP connection error!');
      console.log(error);
      return;
    }

    if (wasReconnect) {
      console.log('Reestablishment of a connection.');
    } else {
        console.log('connected!');
    }

    ddpclient.call('login',
    [{
      user: {username: USERNAME},
      password: {digest: PASSWORDHASH, algorithm: 'sha-256'}
    }],
    function (err, result) {
      if (result) {
        console.log(result);
/*
        // Basically query for all roms available
        ddpclient.call('getAvailableRoomsAdvancedNew',
        [{
          room: {_id: ''},
          startDate: '2019-03-27T14:00:00+00:00',
          endTDate: '2019-03-27T14:10:00+00:00',
          location: {country: false, city: false, building: false, floor: false},
          seats: '1-100',
          equipment: {
            wifi: false,
            whiteboard: false,
            videoConference: false,
            computer: false,
            projector: false,
            teleConference: false,
            information: false,
            minto: false,
            display: false,
            lights: false,
            ac: false
          },
          customEquipment: [],
          isFiltered: true,
          metadata: {demoMode: false}
        }],
        function (err, result) {
          if (result) {
            console.log(result);
            // Loop all found rooms and book them
            result.fullMatchArray.forEach(room => {
                console.log(`Booking: ${room.alias} (${room._id})`);


            }); // foreach room

          } else {
            console.log(err);
          }

        }
      );*/


      } else {
        console.log(err);
      }
    });
});




// ----------------------- Express

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


  app.route('/bookMeeting')
    .get(bookMeeting)
    .post(bookMeeting);

    app.route("/extendMeeting")
        .get(extendMeeting);

    app.route("/clear")
    .get(clear);

/*
  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);
*/

app.listen(port);

function bookMeeting(req, res) {
//    console.log(req);
    console.log({
        roomId: "RbCBHzufM5WDR2D37",
        startDate: req.query.startDate, //moment().format("YYYY-MM-DDTHH:mm:ssZ"),
        endDate: req.query.endDate, // moment().add(2, 'minutes').format("YYYY-MM-DDTHH:mm:ssZ"),
        subject: req.query.subject, //'Fika meeting!',
        confirmed: false,
        pin: null,
        //rfid: null,
    });
    ddpclient.call('createBooking',
        [{
            roomId: "RbCBHzufM5WDR2D37",
            startDate: req.query.startDate, //moment().format("YYYY-MM-DDTHH:mm:ssZ"),
            endDate: req.query.endDate, // moment().add(2, 'minutes').format("YYYY-MM-DDTHH:mm:ssZ"),
            subject: req.query.subject, //'Fika meeting!',
            confirmed: false,
            pin: null,
            //rfid: null,
        }],
        function (err, result) {
            if (result) {
                console.log(result);
            } else {
                console.log(err);
            }
        });

    res.json({ start: req.query.start, body: "meeting booked" } );
}

function extendMeeting(req, res) {
    xapi.command("UserInterface Message TextInput Display", { Text: "Do you want to extend the meeting?" });
    res.json({ status: "Success" } );
}

function clear(req, res) {
    xapi.command("UserInterface Message TextInput Clear");
    res.json({ status: "Success" } );
}

// Connect over ssh to a codec
const xapi = jsxapi.connect('ssh://192.168.1.223', {
  username: 'oraclehack',
  password: 'oraclehack',
});


// Connect over ssh to a codec
const xapiSmall = jsxapi.connect('ssh://192.168.1.204', {
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
/*
    xapi.status
    .get('UserInterface Message TextInput Response')
    .then((response) => {
        console.log("Response:");
        console.log(response);
        xapi.feedback.on('/UserInterface/Message/TextInput/Response', (count) => {
            console.log(`Updated count to: ${count}`);
        });
    });
*/
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
//off();