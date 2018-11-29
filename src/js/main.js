var flatpickr = require('flatpickr');
var moment = require('moment');

var now = moment().format("DD-MM-YYYY HH:mm");
$("#addOrg_date").flatpickr({
    enableTime: true,
    minDate: "today",
    dateFormat: "d-m-Y H:i",
    time_24hr: true,
    defaultDate: now
});