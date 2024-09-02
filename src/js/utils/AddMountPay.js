const moment = require('moment');

function calculateNextPayDate(paymentDate) {
    let nextPay = paymentDate;
    if (typeof nextPay === 'string') {
        nextPay = moment(nextPay, 'DD/MM/YYYY HH:mm A').toDate();
    }

    const newDate = nextPay ? moment(nextPay).add(1, 'month') : moment().add(1, 'month');
    const day = newDate.date();
    const month = newDate.month() + 1;
    const year = newDate.year();

    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

module.exports = { calculateNextPayDate };
