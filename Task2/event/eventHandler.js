const Redisclient = require('../Config/redis');
const EventRouter = require('../Services/event_router.service');
console.log("Munshi event handler module loaded");

//     EventRouter.register_handler('MUNSHI_EVENT', async(event_data)=>{
//         console.log('Munshi recied data to log', event_data);

//     }, {
//         name: "Munshi_Event_Loggerr"
//     })
//    console.log('Munshi Event logger registered successfully');

//     EventRouter.register_handler('USER_CREATED', async(event_data)=>{
//         console.log(event_data);
//         console.log(`User Created:${event_data.event_data.userId}, ${event_data.event_data.name}`);
//     }, {
//         priority:1,
//         name:'user_Created_handler'
//     });

    EventRouter.register_handler('USER_LOGIN', async(event_data)=>{
        console.log(event_data);
        console.log(`User login Successfully: ${event_data.event_data.user._id}, ${event_data.event_data.user.name}`)
        const cacheduser =  await Redisclient.set(`user: ${event_data.event_data.user._id}`, JSON.stringify(event_data));
        const keys = await Redisclient.keys("*");
        for(key of keys){
        const value = await Redisclient.get(key);
    }
    console.log(`Cached user detils: ${cacheduser}`);
    },{
        priority: 1,
        timeout:null,
        name:'REDIS_CACHE_HANDLER'

    });

    EventRouter.register_handler('USER_UPDATE', async(event_data)=>{
        console.log('User Created Needs Updation');
    }, {priority:5,
        timeout:3000,
        name:'Update handler called'
    } );

//applying middlewre to all incoming events to add stamp.

    EventRouter.use((event_id, event_data)=>{
        return{
            event_data,
            processedAt: new Date().toISOString
        }
    });