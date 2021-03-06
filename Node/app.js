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
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

    app.route('/bookMeeting')
        .get(bookMeeting)
        .post(bookMeeting);
/*
    app.route("/extendMeeting") // extend Liso meeting
        .get(extendMeeting);
*/
    app.route("/extendMeetingDialog") // Bring up extension dialog.
        .get(extendMeetingDialog);

    app.route("/aboutToStart")
        .get(meetingIsAboutToStart);

    app.route("/clear")
        .get(clear);

    app.route("/deleteMeeting")
        .get(deleteMeeting);

/*
  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);
*/

app.listen(port);
/*
function extendMeeting(req, res) {
    const updateEvent = {
        _id: req.query.id,
        startDate: req.query.startDate, //moment().format("YYYY-MM-DDTHH:mm:ssZ"),
        endDate: req.query.endDate
    };
    console.log("extend meeting called");
    console.log(updateEvent);
    ddpclient.call('updateEvent', [ updateEvent ],
    function (err, result) {
        if (result) {
            res.json( result );
            console.log(result);
        } else {
            console.log(err);
            res.json(err);
        }
    });

}
*/

var lastStartDate = null;
var lastEndDate = null;
var lastID = null;
function bookMeeting(req, res) {
    lastStartDate = req.query.startDate;
    lastEndDate = req.query.endDate;
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
                res.json({ bookingId: result.body.id, status: result.type } );
                console.log(result);
                lastID = result.body.id;
            } else {
                console.log(err);
                res.json(err);
            }
        });


}

function deleteMeeting(req, res) {
    ddpclient.call('deleteEvent', [ { bookingId: lastID, pin: null, rfid: null, ongoing: true } ],(err, result) => {
        if (result) {
          console.log(result);
        } else {
          console.log(err);
        }
      });
}

// ---------------- xAPI

function meetingIsAboutToStart(req, res) {
    xapi.command("UserInterface Message Prompt Display",
        {
            Title: 'A meeting is about to start in this room',
            Text: "Do you want to start the meeting now?",
            Duration: 60,
            FeedbackId: 'meet_start',
            'Option.1': 'Yes start meeting',
            'option.2': 'Cancel',
            }
        );
    const big = xapi.event.on('UserInterface Message Prompt Response', (event) => {
        switch (event.FeedbackId) {
            case 'meet_start':
            switch (event.OptionId) {
                case '1':
                axios.get("http://localhost:8092/startmeeting")
                .then((res) => {
                    console.log("Started meeting");
                })
                .catch((error) => {
                    console.error(error)
                });
                break;
                case '2':
                // cancel do nothing
                break;
            }
            break;
            default:
            // Ignore
        }
        });
    res.json({ status: "Success" } );
}

function extendMeetingDialog(req, res) {
    PresentExtender(xapi, xapiSmall);

    //xapi.command("UserInterface Message TextInput Display", { Text: "Do you want to extend the meeting?" });
/*    xapi.command("UserInterface Message TextInput Display",
    {
        Title: 'Meeting will end in 5 minutes',
        Text: "Do you want to extend the meeting (max 10 minutes)?",
        InputType: 'Numeric',
        PlaceHolder: 'Number of minutes',
        Duration: 60,
        FeedbackId: 'meet_extend',
        SubmitText: 'Extend',
    }
    );*/
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


const axios = require('axios')


var roomPeopleCount = 0;
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
                roomPeopleCount = count.Current;
                if(roomPeopleCount != -1) {
                    //axios.post("http://192.168.1.242:8092/devicedata", {
                    //axios.post("http://localhost:8092/devicedata", {
                    axios.post("http://preprodspacemanagement.smartenspaces.com:1827/devicedata", {
                        type: "peoplecount",
                        value: roomPeopleCount,
                        "timestamp": Date.now(),
                    })
                    .then((res) => {
                        //console.log(`statusCode: ${res.statusCode}`)
                        //console.log(res)
                    })
                    .catch((error) => {
                    //console.error(error)
                    });
                }
            });

        })
        .catch((err) => {
            console.log(`Failed to fetch PeopleCount, err: ${err.message}`);
            console.log(`Are you interacting with a RoomKit? exiting...`);
            xapi.close();
        });
  xapi.feedback.on('/Status/RoomAnalytics/AmbientNoise/Level', (status) => {
    let dBA = parseInt(status.dBA);
    console.log('dba', dBA);
    
    axios.post("http://preprodspacemanagement.smartenspaces.com:1827/devicedata", {
                        type: "sound",
                        value: dBA,
                        "timestamp": Date.now(),
                    })
                    .then((res) => {
                        //console.log(`statusCode: ${res.statusCode}`)
                        //console.log(res)
                    })
                    .catch((error) => {
                    //console.error(error)
                    });
  });
  
});




function extendMeeting(minutes) {
  const updateEvent = {
    _id: lastID,
    startDate: lastStartDate, //moment().format("YYYY-MM-DDTHH:mm:ssZ"),
    endDate: moment(lastEndDate).add(minutes, "minutes").format("YYYY-MM-DDTHH:mm:ssZ")
  };
  console.log("extend meeting called");
  console.log(updateEvent);
  ddpclient.call('updateEvent', [ updateEvent ],
    function (err, result) {
      if (result) {
        console.log( result );
      } else {
        console.log(err);
      }
  });
  console.log('extend meeting ', minutes);
  axios.get("http://preprodspacemanagement.smartenspaces.com:1826/addons/api/extendmeeting?minutes=" + minutes)
    .then((res) => {
        console.log("Started meeting");
    })
    .catch((error) => {
        console.error(error)
    });
}

function closeDialoges(board, screen) {
  screen.command('UserInterface Extensions Panel Close');
  board.command('UserInterface Message Prompt Clear');
}

function handleMinuteChange(event, extendTime) {
  if (event.Type == 'clicked') {
    if (event.Value == 'increment') {
      extendTime++;
    } else if (extendTime > 0) {
      extendTime--;
    }
  }
  return extendTime;
}

var extendTime = 15;

xapi.event.on('UserInterface Message Prompt Response', (event) => {
  switch (event.FeedbackId) {
    case 'meet_extend':
      switch (event.OptionId) {
        case '1':
          extendMeeting(15);
          break;
        case '2':
          extendMeeting(30);
          break;
        case '3':
          // cancel do nothing
          break;
      }
      closeDialoges(xapi, xapiSmall);
      break;


    default:
    // Ignore
  }
});

var lightToken;

function renewLightToken() {
  axios.post(
    'https://api.interact-lighting.com/oauth/accesstoken',
    'app_key=gRhpONVKAGYvBsfwVyrROH1pWAAkkNuk&app_secret=c4XFB50DsCbNgJPP&service=officeWiredOnPremise',
    {
      headers: {
        'authorization': 'Basic MjAxOHJvYWRzaG93MVxhcGl1c2VyOkNpc2NvaGFja2F0b24hMTIz',
        'content-type': 'application/x-www-form-urlencoded',
      }
    }
  ).then((resp) => {
    lightToken = resp.data.token;
  }).catch((err) => {
    console.error('failed', err);
  });

  setTimeout(renewLightToken, 3500 * 1000);
}

renewLightToken();

function setLight(value) {
  let lights = [2, 3, 4, 5, 6, 7];
  let  config = {
    headers: {
      'authorization': `Bearer ${lightToken}`,
      'content-length': 0,
    }
  };
  value = value.toFixed(0);

  lights.forEach((light) => {
    let url = 'https://api.interact-lighting.com/interact/api/officeWiredOnPremise/control/2018roadshow1/applyLuminaireLevel/1004/'
    + light + '/' + value;
    axios.put(url, {}, config);
  })
}

xapiSmall.event.on('UserInterface Extensions Widget Action', (event) => {
  switch (event.WidgetId) {
    case 'minute_set':
      extendTime = handleMinuteChange(event, extendTime);
      xapiSmall.command('UserInterface Extensions Widget SetValue',
        { value: extendTime, widgetid: 'minute_set' });
      break;
    case 'extend':
      if (event.Type === 'pressed') {
        return;
      }
      if (event.Value === '2') {
        extendMeeting(extendTime);
      }
      closeDialoges(xapi, xapiSmall);
      break;
    case 'light':
      if (event.Type !== 'changed') {
        return;
      }
      setLight(parseInt(event.Value) * 100 / 255);
      break;
    case 'release':
      if (event.Type !== 'clicked') {
        return;
      }
      xapiSmall.command('UserInterface Extensions Widget SetValue',
        { value: 'Released', widgetid: 'release_status' })
      .then((_) => {
        console.log('delete meeting ', lastID);
        ddpclient.call('deleteEvent', [ { bookingId: lastID, pin: null, rfid: null, ongoing: true } ],(err, result) => {
          if (result) {
            console.log(result);
          } else {
            console.log(err);
          }
        });

      })
      .catch((err) => {
        console.log('failed to set value', err);
      });
      xapiSmall.command('UserInterface Extensions Panel Close');
      break;
  }
});

function PresentExtender(board, screen) {
  board.command('Standby Deactivate');
  board.command("UserInterface Message Prompt Display",
    {
      Title: 'Meeting will end in 5 minutes',
      Text: "Extend meeting?",
      Duration: 60,
      FeedbackId: 'meet_extend',
      'Option.1': '+15 minutes',
      'Option.2': '+30 minutes',
      'option.3': 'Cancel',
    }
  );

  screen.command('Standby Deactivate');
  screen.command('UserInterface Extensions Panel Open',
    { panelid: 'extender_1' });
  screen.command('UserInterface Extensions Widget SetValue',
    { value: extendTime, widgetid: 'minute_set' });
}

//PresentExtender(xapi, xapiSmall);

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


// De-register feedback
//off();



// ------------------------ MQTT connect

var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.128');

client.on('connect', function () {
    client.subscribe('LYS01-1-Egner/SensorBoards/Box1/eco2', function (err) {
        if (!err) {
        //client.publish('presence', 'Hello mqtt');
        }
    })
})

var co2 = 0;
client.on('message', function (topic, message) {
    // message is Buffer
    co2 = parseInt(message.toString());
    if (co2 > 1000) {
        console.log("High CO2!!!");
        xapi.command("UserInterface Message TextLine Display", { Text: "CO2 level is high, consider opening a window. CO2 level: " + co2, Duration:5, X:10, Y:200 });
    }
    axios.post("http://preprodspacemanagement.smartenspaces.com:1827/devicedata", {
        type: "co2",
        "timestamp": Date.now(),
        value: co2,
    })
    .then((res) => {
        //console.log(`statusCode: ${res.statusCode}`)
        //console.log(res)
    })
    .catch((error) => {
    //console.error(error)
    });

    console.log(message.toString());
    //client.end();
})