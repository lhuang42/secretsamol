require('dotenv').config()
const express = require('express')
const airtable = require('airtable')
const app = express()
const port = process.env.SERVER_PORT
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');

app.use(bodyParser.json())
app.use(express.static('dist'))

var base = new airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID)

const fn = {
  'email': 'Email Address',
  'name': 'Username',
  'other': 'Etc',
  'contact_platform': 'Preferred Contact Platform',
  'contact_username': 'Preferred Contact',
  'request_chars': 'Request Characters',
  'request_char_names': 'Request Characters Lookup',
  'request_ships': 'Request Ships',
  'request_ship_names': 'Request Ships Lookup',
  'request_text': 'Request Text',
  'request_url': 'URL',
  'offer_chars': 'Offer Characters',
  'offer_char_names': 'Offer Characters Lookup',
  'offer_ships': 'Offer Ships',
  'offer_ship_names': 'Offer Ships Lookup',
  'offer_text': 'Offer Text',
  'offer_seasons': 'Season Choices',
  'offer_season_names': 'Season Choices Lookup',
  'offer_any': 'Any Character',
  'unwanted_chars': 'Unwanted Characters',
  'unwanted_char_names': 'Unwanted Characters Lookup',
  'unwanted_ships': 'Unwanted Ships',
  'unwanted_ship_names': 'Unwanted Ships Lookup',
  'unwanted_text': 'Unwanted Text'
}

function pageResponses(res, select) {

  var resultsLookup = {};

  select.eachPage((records, fetchNextPage) => {
    records.forEach((record) => {
      resultsLookup[record.id] = {id: record.id, name: record.fields['Name'], ...record.fields};
    });
    fetchNextPage();
  }, function done(error, record) {
    if (error) {
      console.log(error)
      res.send(500).status('There was an issue communicating with AirTable.')
      return;
    }
    res.send(resultsLookup);
  });
}

function formatSignupForClient(s) {

  var form = {
    'email': '',
    'name': '',
    'other': '',
    'contact_platform': '',
    'contact_username': '',
    'request_chars': [],
    'request_ships': [],
    'request_text': '',
    'request_url': '',
    'offer_chars': [],
    'offer_ships': [],
    'offer_text': '',
    'offer_seasons': [],
    'offer_any': false,
    'unwanted_chars': [],
    'unwanted_ships': [],
    'unwanted_text': ''
  }

  for (key of Object.keys(form)) {
    var value = s[ fn[key] ];
    if (value) {
      form[key] = value;
    }
  }

  return form

}

const validateForm = [
  check('name').notEmpty().trim(),
  check('email').exists().isEmail().normalizeEmail(),
  check('other').stripLow({ keep_new_lines: true }).trim(),
  check('contact_platform').exists().notEmpty().isIn(['Twitter', 'Tumblr', 'Discord', 'E-mail']),
  check('contact_username').exists().trim(),
  check('request_text').exists().notEmpty().stripLow({keep_new_lines: true}).trim(),
  check('request_url').trim().escape(),
  check('offer_text').exists().notEmpty().stripLow({keep_new_lines: true}).trim(),
  check('offer_any').toBoolean(),
  check('unwanted_text').stripLow({keep_new_lines: true}).trim()
]

function formatFormForSignup(form) {
  var fields = {}

  for (key of Object.keys(form)) {
    var field_name = fn[key]
    if (field_name) {
      fields[field_name] = form[key]
    } else {
      throw 'Form contains an invalid field'
    }
  }
  return fields;

}

app.get('/seasons', (req, res) => {

  var select = base('Season Choices').select({
    view: "Grid",
    fields: ["Name"]
  });

  pageResponses(res, select);
  
})

app.get('/characters', (req, res) => {

  var select = base('Character Choices').select({
    view: "Grid view",
    fields: ["Name"]
  });

  pageResponses(res, select);

})

app.get('/ships', (req, res) => {

  var select = base('Ship Choices').select({
    view: "Grid view",
    fields: ["Name"]
  });

  pageResponses(res, select);

})

app.get('/signup/:id', (req, res) => {

  var id = req.params.id;

  base('Signups').find(id, function(err, signupRecord) {
    if (err) { 
      console.log(err)
      res.status(404).send('Could not find that signup!');
      return;
    }

    var form = formatSignupForClient(signupRecord.fields);
    res.send(form);
  });

})

app.post('/signup/new', validateForm, (req, res) => {

  var body = req.body
  var formatted = formatFormForSignup(body)

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  formatted['Raw'] = JSON.stringify(req.body)

  base('Signups').create([
    {
      fields: formatted 
    }
  ], function(err, records) {
    if (err) {
      res.status(400).send('There was an issue creating the signup in AirTable.')
      return
    }
    res.send(records[0].getId())
  });

})

app.post('/signup/update/:id', validateForm, (req, res) => {

  var id = req.params.id
  var body = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var formatted = formatFormForSignup(body)
  formatted['Raw'] = JSON.stringify(req.body)

  base('Signups').update([
    {
      id: id,
      fields: formatted 
    }
  ], function(err, records) {
    if (err) {
      console.error(err)
      res.status(400).send('There was an issue updating the signup in Airtable.')
      return
    }
    res.send(records[0].getId())
  });

})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})