const https = require('https');

const CALENDARS = [
  'https://calendar.google.com/calendar/ical/isp0aqetd5ev77bbip8qedoumtm2d8dm%40import.calendar.google.com/public/basic.ics',
  'https://calendar.google.com/calendar/ical/05a303dcpubecvb71oesqta0abd7erq8%40import.calendar.google.com/public/basic.ics',
  'https://calendar.google.com/calendar/ical/qd2cmo6ss80qgosplkfv4d2gsnnqtpem%40import.calendar.google.com/public/basic.ics'
];

function fetchIcal(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const id  = parseInt(event.queryStringParameters?.id ?? '0', 10);
  const idx = id - 1;

  if (idx < 0 || idx >= CALENDARS.length) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Calendar not found' }) };
  }

  try {
    const data = await fetchIcal(CALENDARS[idx]);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      },
      body: data
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
