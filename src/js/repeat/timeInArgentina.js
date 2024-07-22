const moment = require('moment-timezone');

const timeInArgentina = () => {
    const argentinaTime = moment.tz("America/Argentina/Buenos_Aires");
    const formattedDateTime = argentinaTime.format('DD/MM/YYYY hh:mm A');
    return formattedDateTime;
}

module.exports = timeInArgentina;