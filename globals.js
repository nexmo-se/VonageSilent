import { FLAVOR } from '@env'

global.myCountry = 'US';
global.myPhone = '';
global.back = '';
global.logo = require('./src/assets/vonage.png');
global.name = 'Vonage';
global.gstyles = require('./src/public/styles_vonage');
if (FLAVOR == 'westpac') {
    global.myCountry = 'AU';
    global.myPhone = '';
    global.back = require('./src/assets/wpback.jpeg');
    global.logo = require('./src/assets/westpac_logo.png');
    global.name = 'Westpac';
    global.gstyles = require('./src/public/styles_westpac');
}
if (FLAVOR == 'optus') {
    global.myCountry = 'AU';
    global.myPhone = '';
    global.back = '';
    global.logo = require('./src/assets/optus2.png');
    global.name = 'Optus';
    global.gstyles = require('./src/public/styles_optus');
}
