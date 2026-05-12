const express = require('express');
const https   = require('https');
const path    = require('path');

const app  = express();
const PORT = 3000;

const CALENDARS = [
  'https://calendar.google.com/calendar/ical/isp0aqetd5ev77bbip8qedoumtm2d8dm%40import.calendar.google.com/public/basic.ics',
  'https://calendar.google.com/calendar/ical/05a303dcpubecvb71oesqta0abd7erq8%40import.calendar.google.com/public/basic.ics',
  'https://calendar.google.com/calendar/ical/qd2cmo6ss80qgosplkfv4d2gsnnqtpem%40import.calendar.google.com/public/basic.ics'
];

// Serve static files (index.html etc.)
app.use(express.static(path.join(__dirname)));

// Calendar proxy — avoids browser CORS restriction on Google Calendar iCal URLs
app.get('/api/calendar/:id', (req, res) => {
  const idx = parseInt(req.params.id, 10) - 1;
  if (idx < 0 || idx >= CALENDARS.length) {
    return res.status(404).json({ error: 'Calendar not found' });
  }

  https.get(CALENDARS[idx], (upstream) => {
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    upstream.pipe(res);
  }).on('error', (err) => {
    console.error('Calendar fetch error:', err.message);
    res.status(502).json({ error: err.message });
  });
});

app.listen(PORT, () => {
  console.log(`TrackFit Dev Server → http://localhost:${PORT}`);
  console.log(`Calendar proxy:`);
  CALENDARS.forEach((_, i) =>
    console.log(`  http://localhost:${PORT}/api/calendar/${i + 1}`)
  );
});
