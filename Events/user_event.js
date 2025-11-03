
const { getUSer, updateUser } = require('../Controllers/usercontroller');
const userEvent = require('../emitter/eventemitter');
const {logActivity} = require('../utils/activity');

userEvent.on("eventTask", async(type,data)=>{
   logActivity(type, data);
});

   
// userEvent.on("eventTask",async(type,data)=>{
//    //   console.log("Event Triggered:", type);
//      console.log("Data:", data);

//    switch (type) {
//       case  "createUser":
//          console.log("User Event Triggered")
//          break;

//          case  "getUSer":
//          console.log("User Event Triggered")
//          break;
//          case "updateUser":
//          console.log("userupdate event triggerd")   
//       default:
//          break;
   
// }

//   }
// )

