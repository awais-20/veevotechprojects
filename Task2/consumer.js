require('dotenv').config();
const consume = require('./Core_App_Connectivities/consumer');

consume("chat_queue");
