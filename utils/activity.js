const fs = require('fs');
const path  =require('path');

const logfile = path.join(__dirname, '../logs/logfile.js')

async function logActivity(eventTask, data){
    const logData  ={
        time: new Date().toISOString(),
        eventTask,
        data
    }

fs.appendFileSync(logfile, JSON.stringify(logData) + "\n", 'utf-8');

}
module.exports ={
    logActivity
}
