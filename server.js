const { GAME } = require("./gameroom.js");
const {sleep,fs, url, path, WS, contentTypes, ERRORCODES,Client,Room,Server} = require("./serverside.js");
require("dotenv").config()
const {createClient} = require('@supabase/supabase-js');
const SUPA = createClient("https://gugbecteznzhrfighfjd.supabase.co", process.env.SUPAKEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const mailer = require("nodemailer").createTransport({    
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // � Only for testing! Remove in production.
    }
});
async function sendEmail(recipients, subject, content) {
    try {
        await mailer.sendMail({
            from: "SteveIsRad Net", 
            to: recipients.join(', '), 
            subject: subject,
            html: content
        });
        return 1; //success
    }catch (e) {
        return 0;//error
    }
}
let ip = /*'localhost'*/'167.88.39.205'
let server = new Server(8000); 
console.log(new Date().toLocaleString("en-US"))
console.log(`http://${ip}:8000`)

let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_.";
let pending = {}
server.app.use(require("express").text());

function randInt(max) {
    return Math.floor(Math.random()*max)
}
function rngWord(i,allowSpecials=1){
    if (i <= 0) return ''
    return alphabet[randInt(62 + allowSpecials*2)] + rngWord(i-1,allowSpecials)
}
let allowedProfileImages = [
    'https://i.pinimg.com/736x/1a/e3/8b/1ae38b5d8d53173046e9107f6ad4a329.jpg', //luffy
    'https://seakoff.com/cdn/shop/articles/exploring-zoro-from-one-piece-the-legendary-swordsman-and-his-epic-battles-299359.jpg?v=1718531298', //zoro
    'https://us.oricon-group.com/upimg/detail/5000/5194/img660/onepiece-nami-birthday-2025-01.jpg', //nami
    'https://i.pinimg.com/736x/5c/38/fc/5c38fcfe181a1da8b511775e30042b33.jpg', //shanks
    'https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/09/crocodile.jpg', //crocodile
    'https://static.beebom.com/wp-content/uploads/2024/05/Dr.-Vegapunk.jpg', //vegapunk
    'https://static0.cbrimages.com/wordpress/wp-content/uploads/2019/11/Featured-Things-About-Eustass-Kid.jpg', //kidd
    'https://static0.srcdn.com/wordpress/wp-content/uploads/2024/03/kaido-hybrid-form.jpg' // kaido
]
let correspondingNames =  ['Luffy', 'Zoro', 'Nami', 'Shanks', 'Croc', 'Vegapunk','Kid', 'Kaido']
server.app.get("/loginep", async (req, res)=>{
       res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });
    res.flushHeaders();
    let email =  req.query.email.toLocaleLowerCase();
    if (pending[email]) {
        pending[email][1].push(res)
        return res.write(`data: ${JSON.stringify({good:true,details:"Email was already awaiting verification! Please check your email."})}\n\n`)
    }
    let rcode = rngWord(256)
    if (await sendEmail([email],"Verify Email for OPCG ONLINE", `
        <h2>Thank you for logging in / signing up with OPCG Online!</h2>
        <p><a href="http://${ip}:8000/verify?email=${email}&rcode=${rcode}" >Click here to verify your email</a></p>
        <br>
        <h4><i>Note: We use SteveIsRad's email bot to secure login. As long as you requested this email, it is safe to click!</i></h4>`
    )){
        pending[email] = [rcode, [res], Date.now()];
        console.log("Sent to:",email,pending[email]);
        res.write(`data: ${JSON.stringify({good:true,details:"Email Sent"})}\n\n`);
    }else{
        res.write(`data: ${JSON.stringify({good:false,details:"Something went wrong sending email! Check for typos!"})}\n\n`);
    }
})
server.app.get("/verify", async (req,res) =>{
    console.log("Verifying:" , req.query.email,req.query.rcode);
    let email = req.query.email.toLocaleLowerCase();
    res.setHeader('Content-Type', 'text/html');
    if (!pending[email]) return res.send("<h2>Email did not request verification or link may have expired </h2>");
    if (pending[email][0] != req.query.rcode) return res.send("<h2>Email verification code invalid.</h2>");
    
    let sres = await SUPA.from('Users').select().eq('email',email).maybeSingle()
    if (sres.error) return res.send(`<p>Error: ${sres.error.message}</p>`);
    let user = sres.data;
    let session = rngWord(256)
    console.log(user)
    let idx= randInt(allowedProfileImages.length)
    if (!user) {
        let sres = await SUPA.from('Users').insert({
            email,
            sessions: [session],
            memberType: 1,
            name:  correspondingNames[idx] + " " + (Math.floor(Math.random()*9000)+1000),
            profileImage: allowedProfileImages[idx]
        }).select().maybeSingle()
        if (sres.error) res.send(`<p>Unlikely Error: ${sres.error}</p>`)
        console.log(sres)
        user = sres.data
    }
        user.sessions.push(session)
         sres = await SUPA.from('Users').update({
            sessions: user.sessions
        }).eq('email',email)
        if (sres.error) res.send(`<p>Unlikely Error: ${sres.error}</p>`)
    

    pending[email][1].forEach(r=> r.write(`data: ${JSON.stringify({good:true,details:{
            userId: user.id,
            session
        }})}\n\n`)
    );
    pending[email] = undefined;
    delete pending[email];
    
    return res.send(`<h2>Success! You can close this window, you are now logged into OPCG!</h2>`);
})

let loauid = [0,1,5,6,8,10,13,18]
server.app.get('/addToList',async (req,res)=>{
    if (req.query.auth=='BigBootyLatinas22') {
        loauid.push(Number(req.query.uid));
        console.log("LOAUID",loauid)
        res.send("Good");
    }
    res.send("Bad")
})
server.app.get(`/cardsby`,async (req, res)=>{
    let arr = JSON.parse(fs.readFileSync("./Data/ccbase.json").toString()).filter(c=>c.uploader==req.query.user)
    return res.send(JSON.stringify(arr));
})
server.app.get(`/refinedCardSearch`,async (req,res)=>{
    let arr =[]
    console.log(req.query)
    if (req.query.cus) arr = JSON.parse(fs.readFileSync("./Data/ccbase.json").toString())
    else arr = JSON.parse(fs.readFileSync("./Data/cardbase.json").toString())
    arr = arr
            .filter(c=>c.name.toLocaleLowerCase().includes((req.query.name || '').toLocaleLowerCase())) 
            .filter(c=>c.set.toLocaleLowerCase().includes((req.query.name || '').toLocaleLowerCase()));
    console.log(arr)
    res.send(JSON.stringify( arr ) );
})
server.app.post('/uploadep',async (req,res)=>{
    let body = JSON.parse(req.body);
    console.log(body)
    let userId = Number(body.userId)
    let session = body.session
    let sres = await SUPA.from("Users").select().eq("id",userId).maybeSingle();
    if (sres.error) return res.send(JSON.stringify({good:false,details:sres.error.message}))
    if (!sres.data) return res.send(JSON.stringify({good:false,details:"User not found"}))
    if (!body.imgs || !body.imgs.length) return res.send(JSON.stringify({good:false,details:"Please upload an image!"}));
    for (let i = 0; i < body.imgs.length;i++) if (body.imgs[i].toLocaleLowerCase().includes('discord'))return res.send(JSON.stringify({good:false,details:"Discord links expire! Not allowed. (I recommend imgbb or imgur)"}));
    for (let i = 0; i < sres.data.sessions.length; i++) {
        if  (sres.data.sessions[i] == session) {
            body.session = null;
            body.uploader = userId;
            body.userId = null;
            //////////////////////////////////////
            console.log(body)
            if (body.custom) {
                if (loauid.includes(userId)) {
                    let arr = JSON.parse(fs.readFileSync("./Data/ccbase.json").toString())
                    if (arr.find(c=>c.set == body.set && c.iid == body.iid)) return res.send(JSON.stringify({good:false,details:"Card already exists in DB. Please choose a different set hash or id. Thank you!"}))
                    body.uid = arr.length? arr[arr.length - 1].uid + 1 : 0
                    arr.push(body)
                    fs.writeFileSync("./Data/ccbase.json",JSON.stringify(arr))
                    return res.send(JSON.stringify({good:true, details: "Upload Successful"}))
                }
                return res.send(JSON.stringify({good:false, details: "You are not authorized to post custom cards! Contact steveistheman on discord!"}))
            }
            let arr = JSON.parse(fs.readFileSync("./Data/cardbase.json").toString() )
            if (arr.find(c=>c.set == body.set && c.iid == body.iid)) return res.send(JSON.stringify({good:false,details:"Card already exists in DB. We currently do not allow users to upload alt arts. Thank you though!"}))
            body.uid = arr[arr.length - 1].uid + 1
            arr.push(body)
            fs.writeFileSync("./Data/cardbase.json",JSON.stringify(arr))
            return res.send(JSON.stringify({good:true,details:"Thank you for uploading the missing card!"}))
            //////////////////////////////////////
        }     
    }
    return res.send(JSON.stringify({good:false,details:"Session token not authenticated. Try logging back in"}))
    
})

server.app.post('/editep',async (req,res)=>{
    let body = JSON.parse(req.body);
    console.log(body)
    let userId = Number(body.userId)
    let session = body.session
    let sres = await SUPA.from("Users").select().eq("id",userId).maybeSingle();
    if (sres.error) return res.send(JSON.stringify({good:false,details:sres.error.message}))
    if (!sres.data) return res.send(JSON.stringify({good:false,details:"User not found"}))
    for (let i = 1; i < sres.data.sessions.length; i++) {
        if  (sres.data.sessions[i] == session) {
            body.session = undefined;
            body.uploader = userId;
            body.userId = undefined;
            //////////////////////////////////////
            console.log(body)
            if (body.custom) {
                let arr = JSON.parse(fs.readFileSync("./Data/ccbase.json").toString())
                if (body.uid >= arr.length || arr[body.uid].uploader != userId) return res.send(JSON.stringify({good:false,details:"Attempt to edit card not created by you."}))
                body.uid = Number(body.uid);
                arr[body.uid] = body
                fs.writeFileSync("./Data/ccbase.json",JSON.stringify(arr))
                return res.send(JSON.stringify({good:true, details: "NICE! Please refresh or continue editing"}))
            }

            return res.send(JSON.stringify({good:false,details:"Attempt to edit invalid card"}))
            //////////////////////////////////////
        }     
    }
    return res.send(JSON.stringify({good:false,details:"Session token not authenticated. Try logging back in"}))
})

server.app.post("/logoutep", async (req, res)=>{

})

server.app.post("/editUname",async (req, res) => {
    let body = JSON.parse(req.body); //expecting: id, session, name
    let sres = await SUPA.from("Users").select().eq("id",body.id).maybeSingle();
    if (sres.error | !sres.data) return res.send(JSON.stringify({good:false,details:"Unknown error occurred"}))
    let bad = true
    sres.data.sessions.forEach(sesh => sesh == body.session ? bad = false : false)
    if (bad) return res.send(JSON.stringify({good:false,details:"Auth Error- please try logging back in."}))
    console.log(body) 
    sres = await SUPA.from("Users").update({name:body.name}).eq('id',body.id)
    if (sres.error)return res.send(JSON.stringify({good:false,details:"Error saving changes- please try again."}))
    return res.send(JSON.stringify({good:true,details:"Name Edited Successfully"}))
})
server.app.post("/editPfp",async (req, res) => {
    let body = JSON.parse(req.body); //expecting: id, session, profileImage
    let sres = await SUPA.from("Users").select().eq("id",body.id).maybeSingle();
    if (sres.error | !sres.data) return res.send(JSON.stringify({good:false,details:"Unknown error occurred"}))
    let bad = true
    sres.data.sessions.forEach(sesh => sesh == body.session ? bad = false : false)
    if (bad) return res.send(JSON.stringify({good:false,details:"Auth Error- please try logging back in."}))
    console.log(body) 
    if (!allowedProfileImages.includes(body.profileImage)) return res.send(JSON.stringify({good:false,details:"Invalid Image"}))
    sres = await SUPA.from("Users").update({profileImage:body.profileImage}).eq('id',body.id)
    if (sres.error)return res.send(JSON.stringify({good:false,details:"Error saving changes- please try again."}))
    return res.send(JSON.stringify({good:true,details:"Image Changed Successfully"}))
})

server.app.post("/persist",async (req, res)=>{
    let bdy = JSON.parse(req.body);
    //console.log(bdy)
    let id =  Number(bdy.id);
    let sesh = bdy.sesh; // encoded sesh
    let sres = await SUPA.from("Users").select().eq("id",id).maybeSingle();
    if (sres.error) return res.send(JSON.stringify({good:false,details:sres.error.message}))
    if (!sres.data) return res.send(JSON.stringify({good:false,details:"User not found"}))
    for (let i = 0; i < sres.data.sessions.length; i++) {
        if  (sres.data.sessions[i] == sesh) {
            sres.data.sessions = "";
            sres.data.session = sesh;
            sres.data.decks ||= []
            return res.send(JSON.stringify({good:true,details:sres.data}));
        }     
    }

    return res.send(JSON.stringify({good:false,details:"Session token not authenticated"}))
})




//General Files
server.addFile("/cardbase.json", "./Data/cardbase.json","json")
server.addFile("/ccbase.json", "./Data/ccbase.json","json")
server.addFile("/announcer.js","./Client/announcer.js","js")
server.addFile("/clock.js","./Client/clock.js","js")
server.addFile("/fau.js","./Client/fau.js","js")
server.addFile("/nav.js","./Client/nav.js","js")
server.addFile("/colorselect.js","./Client/colorselect.js","js")
server.addFile("/clientside.js","./Client/clientside.js","js")
server.addFile("/campfire.js","./Client/campfire.js","js")

//Font Files
server.addFile("/onepiecefont.ttf","./onepiecefont.ttf","ttf")


//Home
server.addFile("/","./Client/Home/index.html","html")
server.addFile("/main.js","./Client/Home/main.js","js")
server.addFile("/h_styles.css", "./Client/Home/styles.css","css")


//Login
server.addFile("/login","./Client/Login/login.html",'html')
server.addFile("/login.js","./Client/Login/login.js",'js')
server.addFile("/l_styles.css", "./Client/Login/styles.css","css")

//Deck Builder
server.addFile("/build","./Client/DeckBuilder/build.html","html")
server.addFile("/build.js","./Client/DeckBuilder/build.js","js")
server.addFile("/d_styles.css", "./Client/DeckBuilder/styles.css","css")


//Custom Deck Builder
server.addFile("/cbuild","./Client/CDB/build.html","html")
server.addFile("/cbuild.js","./Client/CDB/build.js","js")

//Profile 
server.addFile("/profile","./Client/Profile/profile.html","html")
server.addFile("/profile.js","./Client/Profile/profile.js","js")
server.addFile("/p_styles.css","./Client/Profile/styles.css","css")

//Card Uploader
server.addFile("/upload","./Client/CardUploader/upload.html","html")
server.addFile("/upload.js","./Client/CardUploader/upload.js","js")
server.addFile("/u_styles.css", "./Client/CardUploader/styles.css","css")

//Matchmaking
server.addFile("/matchmaking","./Client/Matchmaking/matchmaking.html","html")
server.addFile("/matchmaking.js","./Client/Matchmaking/matchmaking.js","js")
server.addFile("/m_styles.css","./Client/Matchmaking/styles.css","css")

//Game Room
server.addFile("/game","./Client/Game/game.html","html")
server.addFile("/game.js","./Client/Game/game.js","js")
server.addFile("/g_styles.css","./Client/Game/styles.css","css")

//Rooms
server.addFile("/rooms","./Client/Rooms/rooms.html","html")
server.addFile("/rooms.js","./Client/Rooms/rooms.js","js")
server.addFile("/r_styles.css","./Client/Rooms/styles.css","css")


//Docs
server.addFile("/apidocs","./Client/ApiDocs/index.html",'html')
server.addFile("/docs.js","./Client/ApiDocs/docs.js",'js')
server.addFile("/astyles.css", "./Client/ApiDocs/astyles.css","css")

//Matchmaking Handlers
let recentMMRequests = []
let playersInMatchmaking = []
let userCache = {}
server.authConnection = async (ws, qP) =>{
    console.log(qP);
    let sres = await SUPA.from("Users").select().eq("id",qP.clientID).maybeSingle();
    if (sres.error) return false
    if (!sres.data) return false
    let good = false
    sres.data.sessions.forEach(sesh => sesh == qP.session ? good = true : false) 
    userCache[sres.data.id] = sres.data
    return good
} 
let cons = 'BCDFGHJKLMNPRSTVWXYZ'
let vow = 'AEIOU'
let wnums = '123456789'
let numsw0 = '1234567890'
let outstandingRoomCodes = []
let pendingGameRejoin
function ran(str) {return str[Math.floor(Math.random()*str.length)]}
function genRoomCode(){
    let code = ran(cons)+ran(vow)+ran(cons)   +ran(wnums) + ran(numsw0) + ran(numsw0) + ran(numsw0) 
    if (outstandingRoomCodes.includes(code)) return genRoomCode();
    return code;
}

server.setClientResponder('newRoom',(client,data)=>{
    if (outstandingRoomCodes.length >=5000) return {details:"Server is busy! Too many rooms!"}
    if (client.state != 'idle') return {details: `You already are ${client.state} from somewhere else!`}
    client.state = 'roomhost'
    client.roomCode = genRoomCode();
    outstandingRoomCodes.push(client.roomCode)
    return {roomCode:client.roomCode};
})
server.setClientResponder('joinRoom',async (client,data)=>{
    if (client.state != 'idle') return {details: `You already are ${client.state} from somewhere else!`}
    let room = server.newRoom();
    let orc = outstandingRoomCodes.findIndex(code=>code == data.roomCode)
    if (orc < 0) return {good:false,details:'No room found with this code!'};
    outstandingRoomCodes.splice(orc,1)
    let p1 = Object.values(server.clients).find(c=> c.state == 'roomhost' && c.roomCode == data.roomCode)
    if (!p1) return {good:false,details:'No room found with this code!'};
    let p2 = client
    room.addClient(p1)
    room.addClient(p2)
    room.players = randInt()%2 ? [p1.uid,p2.uid] : [p2.uid,p1.uid];
   // server.request(p1,'gameType',{},(data)=>{
        room.gameType = data.gameType || 1
        room.game = new GAME()
        p1.state = 'ingame'
        p1.roomId = room.roomInfo.id
        p2.state = 'ingame'
        p2.roomId = room.roomInfo.id
        server.request(p1,'matchFound',{
            other:p2.uid,
            roomId: room.roomInfo.id,
            gameType: data.gameType || 1
        });

        server.request(p2,'matchFound',{
            other:p1.uid,
            roomId: room.roomInfo.id,
            gameType: data.gameType || 1
        });    
  //  },1000)
        return true
})
let showpairs = 
    [
        ['oyou',(pnum)=>[pnum==1,pnum==2], 'only themselves'],
        ['oopp', (pnum)=>[pnum==2,pnum==1], 'only their opponent'],
        ['nthr', ()=>[0,0], 'nobody'],
        ['allp',()=>[1,1], 'everyone']
    ]
server.setClientResponder("joinMatchmaking",(client,data)=>{
    if (client.state != 'idle') return false;
    client.timeJoinedMatchmaking = Date.now()
    client.state = 'matchmaking'
    playersInMatchmaking.push(client);
    recentMMRequests.push(Date.now())
    return Math.floor(3600 / (recentMMRequests.length + 8)) +2;
})

function exitMatchmaking(client,data){
    let removed = false;
    playersInMatchmaking = playersInMatchmaking.filter(c => (c != client) ? true: 0*(removed=true) );
    client.state = 'idle'
    if (recentMMRequests.length) recentMMRequests.shift()
    return removed
}
server.setClientResponder("exitMatchmaking",exitMatchmaking)

server.clientAdded = function(client,websocket,queryParams){
    client.connect(websocket);
    client.uid = Number(queryParams.clientID)
    client.recentMatches = userCache[client.uid].gameResults || []
    client.decks = userCache[client.uid].decks
    client.state = 'idle'
    this.clients[queryParams.clientID] = client;

}

server.disconnect =  (client) => {
    console.log("CONNECTION LOST - ", client.id, client.state)
    switch (client.state) {
        case 'roomhost':{
            outstandingRoomCodes = outstandingRoomCodes.filter(x=>x!= client.roomCode) 
            server.clients[client.id] = undefined; //fully disconnects the client (handled internally)
       
        }break;
        case 'matchmaking': {
            exitMatchmaking(client); 
            delete server.clients[client.id] 
            server.clients[client.id] = undefined; //fully disconnects the client (handled internally)

        }break;
        case '__ingame': {
            let game = client.inRooms[0].game;
            let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1
            client.issues = true;
                console.log("DISCON FROM ", client.uid, " ", client.issues)

            msgAll(
                    client.inRooms[0].players,
                    -1,
                    `$[@${client.uid}] is experiencing network issues. We are trying to reconnect!`,
                    game,
                    client.uid
                )
                let allHaveIssues = client.inRooms[0].players.every(uid => {
                     let player = server.clients[uid];
                     if (!player) return 1;
                    return  player.issues;
                 });
                 if (allHaveIssues){
                    console.log("ISSUES FROM ", client.uid, " ", client.issues)
                    client.inRooms[0].players.forEach(uid=>{
                        server.clients[client.id] = undefined; 
                    })
                    client.inRooms[0].close('Both players disconnected');
                 }
        }break; 
    }
}
server.setClientResponder('exitRoomGracefully',(client,data)=>{
    if (!client || client.state != 'ingame' || !client.inRooms.length) return {good:false};
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1
    msgAll(
                    client.inRooms[0].players,
                    -1,
                    `$[@${client.uid}] ended the room!`,
                    game
    )
    client.inRooms[0].players.forEach(uid=>{
        let cl = server.clients[uid]
        cl.state = 'idle'
        cl.rooms = []
    })   
    client.inRooms[0].close('One player has shut down the room');
    return true;
})

//DeckbuildingHandlers
server.app.post('/getDeck',async (req,res) => {
    let body = JSON.parse(req.body); // expecting id, session, slot
    if (body.slot > 3 || body.slot <0) return res.write(JSON.stringify({good:false,details:"Invalid deck slot number!"}))
    let sres = await SUPA.from("Users").select().eq("id",body.id).maybeSingle();
    if (sres.error | !sres.data) return res.write(JSON.stringify({good:false,details:"Unknown error occurred"}))
    let bad = true
    sres.data.sessions.forEach(sesh => sesh == qP.session ? bad = false : false)
    if (bad) return res.write(JSON.stringify({good:false,details:"Auth Error- please try logging back in."}))
    let [name,string] = sres.data.decks[slot].split(',')
    return res.write(JSON.stringify({good:true, name,string}));
})
server.app.post("/setDeck",async (req,res)=>{
    let body = JSON.parse(req.body); //expecting: id, session, slot, deckName, deckString
    if (body.slot > 3 || body.slot <0) return res.send(JSON.stringify({good:false,details:"Invalid deck slot number!"}))
    let sres = await SUPA.from("Users").select().eq("id",body.id).maybeSingle();
    if (sres.error | !sres.data) return res.send(JSON.stringify({good:false,details:"Unknown error occurred"}))
    let bad = true
    sres.data.sessions.forEach(sesh => sesh == body.session ? bad = false : false)
    if (bad) return res.send(JSON.stringify({good:false,details:"Auth Error- please try logging back in."}))
    console.log(body) 
    sres.data.decks = sres.data.decks || []
    sres.data.decks[body.slot]  = body.deckName + ',' + (body.custom*1 || 0) + ',' + body.deckString
    console.log(body.deckName + ',' + (body.custom*1 || 0) + ',' + body.deckString)
    sres = await SUPA.from("Users").update({decks:sres.data.decks}).eq('id',body.id)
    if (sres.error)return res.send(JSON.stringify({good:false,details:"Error saving changes- please try again."}))
    return res.send(JSON.stringify({good:true,details:"Deck Saved Successfully"}))
})

//ServerUpkeepStep 
let step = 0;
let minutes = 1000 * 60;
 function upkeep(){
    let now = Date.now()
    if (step % 7 == 5){
        //Remove old verification emails
        Object.keys(pending).forEach(key=>{
            if (!pending[key]) return ;
            if ( (now - pending[key][2]) > 10*minutes) {
                pending[key][1].forEach(res=>{
                    res.write(`data: ${JSON.stringify({good:false, details:"Email code expired. Please request new code."})}`)
                })
                delete pending[key];
                pending[key] = null;
            } 
        })
        now = Date.now()
    }
    if (step % 20 == 10) {
        recentMMRequests = recentMMRequests.filter(ts=> (now - ts) < 60*minutes)
        now = Date.now()
    }
    if (step %10 == 9){
        Object.values(server.clients).forEach(client=>{
            if (client && client.issues && client.state == 'ingame'){
                let game = client.inRooms[0].game;
                let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1
                client.issues++
                console.log("ISSUES FROM ", client.uid, " ", client.issues)
                if (75 - client.issues*15 <= 0){
                    msgAll(
                                    client.inRooms[0].players,
                                    -1,
                                    `Room closed: connection unstable!`,
                                    game
                    )             
                    client.inRooms[0].players.forEach(uid=>{
                        let cl = server.clients[uid]
                        cl.state = 'idle';
                        cl.rooms = []
                    })          
                    client.inRooms[0].close('Permanent disconnection');
                    server.clients[client.id] = undefined
                    
                }else{
                                    msgAll(
                                client.inRooms[0].players,
                                -1,
                                `Still no connection, room will cloes in about ${105- client.issues*15} seconds`,
                                game
                )   
                }
            }
        })
        now = Date.now()
    }


 
    playersInMatchmaking.forEach((p1,i) => {
        let disparity = 2;
        for (let e = i+1; e < playersInMatchmaking.length; e++){
            let p2 = playersInMatchmaking[e];
            p1.recentMatches = p1.recentMatches || [];
            p1.recentMatches.forEach((match,i) => ((match.p2Id == p2.id || match.p1Id == p2.id) && (now-match.createdAt) <500*minutes) ? disparity+=i : 0)
            if (disparity*1000 < now - p1.timeJoinedMatchmaking &&  2000 < now - p2.timeJoinedMatchmaking){
                let room = server.newRoom();
                room.addClient(p1)
                room.addClient(p2)
                p1.state = 'ingame'
                p1.roomId = room.roomInfo.id
                p2.state = 'ingame'
                p2.roomId = room.roomInfo.id
                room.players = randInt()%2 ? [p1.uid,p2.uid] : [p2.uid,p1.uid];
            room.gameType = 1
        room.game = new GAME()
                server.request(p1,'matchFound',{
                    other:p2.uid,
                    roomId: room.roomInfo.id,
                    gameType: 1
                });
                server.request(p2,'matchFound',{
                    other:p1.uid,
                    roomId: room.roomInfo.id,
                    gameType: 1
                })
                p1.timeJoinedMatchmaking = null;
                p2.timeJoinedMatchmaking = null;
            }
        }   

    })
    step++;
}

setInterval(upkeep,1500);



///Game Handlers
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]]; 
  }
}
function msgAll(players,from,body,game,eventor){
    for (let i = 0; i < players.length;i++){
        server.request(Object.values(server.clients).find(c=>c && c.uid==players[i]) ,'chat',{
            from,
            body,   
            updateplayers:eventor ? players.map(z=> z==eventor) : undefined,
            updateState:eventor ?  game.exportFor(i+1) : undefined,
            players
        })
    }
}
server.setClientResponder('selectDeck',(client,data)=>{
    console.log(client.uid.state)
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data)
    let deckMeta = data.deckmeta;
    let leadMeta = data.leadmeta
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1
    game.reset(pnum)
    deckMeta.forEach(({count,uid,art,custom})=>{
        for (let i = 0;  i < count; i++) game.addCard(game[`player${pnum}`].mainDeck,uid,custom) 
    })
    shuffle(game[`player${pnum}`].mainDeck);
    game.addCard(game[`player${pnum}`].leadZone,leadMeta.uid,leadMeta.custom) 
    game[`player${pnum}`].leadZone[0].revealed = [1,1]
    for (let i = 0; i < 10;i++) game.addDonCard(game[`player${pnum}`].donDeck);
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] loaded and shuffled a new deck! `,
        game,
        client.uid
    )
    return {good:true}
})
server.setClientResponder('tapCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let uid = data.uid;
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    if ( game.ownerOf(game.find(uid))!= pnum) return  {good:false,details:'This is not your card'}

    game.find(uid).tap();
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] ${game.find(uid).active ? 'un':''}tapped $[#${uid}] `,
        game,
        client.uid
    )
    return {good:true}
})
server.setClientResponder('refresh',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 

    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    let p = game[`player${pnum}`]
    Object.keys(p).forEach(zname=>{
        let zone = p[zname]
        for (let i = zone.length - 1; i >= 0; i--) {
            const card = zone[i];
            card.active = true;
            for (let j = card.attached.length - 1; j >= 0; j--) {
                const ac = card.attached[j];
                ac.active = true;
                if (zname != 'donArea' && zname != 'donDeck' && ac.name == 'DON!!') game.move(ac, p.donArea, 0, [1, 1]);
                
            }
            if (zname != 'donArea' && zname != 'donDeck' && card.name == 'DON!!') game.move(card, p.donArea, 0, [1, 1]);
        }
    })
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] unrested all cards and reset all don!!`,
        game,
        client.uid

    )
})
server.setClientResponder('attachCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let uid = data.uid;
    let adornee = data.adornee
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1  
    if ( game.ownerOf(game.find(uid))!= pnum) return  {good:false,details:'This is not your card'}

    if (!game.attach(game.find(uid),game.find(adornee)) && !data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] attached $[#${uid}] to $[#${adornee}]`,
        game,
        client.uid

    ); else {
        return {good:false}
    }
    return {good:true}
})
function tbmatch(t1=[],t2=[]){
    if (t1.length != t2.length) return false;
    for (let i = 0; i < t1.length;i++) if (t1[i] != t2[i]) return false;
     return true
}
server.setClientResponder('revealModeZone',(client, data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let name = data.name
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1  
    
    let zone = game[`player${pnum}`][name]
    zone.forEach(c => c.revealed = data.revealed)
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] revealed  all from ${name} to ${(showpairs.find(zfn=> tbmatch(zfn[1](pnum),data.revealed)) || ['','','??'])[2]}`,
        game,
        client.uid

    ); else {
        return {good:false}
    }
    return {good:true}
})
function spotName(snum, dlen){
    if (snum == 0) return 'top'
    if (snum == dlen) return 'bottom'
    return 'spot ' + (snum+1)
}

server.setClientResponder('moveCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let uid = data.uid;
    let name = data.name
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1  
    
    data.spot = data.spot || 0;
    let card = game.find(uid)
    if ( game.ownerOf(card)!= pnum) return  {good:false,details:'This is not your card'}
    let from = game.nameOf(card.where)
    let ic = card.where.indexOf(card)
    let extraF = from.toLocaleLowerCase().includes('deck') ? '('+spotName(ic,card.where.length)+')' : ''
    let extra = name.toLocaleLowerCase().includes('deck') ? '('+spotName(data.spot,game[`player${pnum}`][name].length)+')' : ''
    if (!game.move(
        card,game[`player${pnum}`][name],
        data.spot, data.revealed ? data.revealed :(
        name.toLocaleLowerCase().includes('deck') || name.toLocaleLowerCase().substring(0,5) == 'ez_xx' ? [0,0]: 
        name.toLocaleLowerCase().includes('hand') || name.toLocaleLowerCase().substring(0,5) == 'ez_0x' ? [pnum == 1, pnum == 2] :
        [1,1])
    ) && !data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] moved $[#${uid}] from ${from}${extraF} to ${name}${extra}`,
        game,
        client.uid

    ); else {
        return {good:false}
    }
    return {good:true}
})
server.setClientResponder('insertCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let metaid = data.id;
    let name = data.name
    let cus = data.cus
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1  
    let revealed = [1,1]
    data.spot =  Math.min(game[`player${pnum}`][name].length,data.spot || 0);
    let btm  =  data.spot == game[`player${pnum}`][name].length
    let extra = name.toLocaleLowerCase().includes('deck') ? (data.spot == 0 ? ' top' : (btm ? ' bottom' : ` spot ${data.spot+1}`)) : ''
    game.addCard(game[`player${pnum}`]['trash'],metaid,cus)
    let card = game[`player${pnum}`]['trash'][game[`player${pnum}`]['trash'].length-1]
    game.move(
        card,
        game[`player${pnum}`][name],
        data.spot, 
        revealed
    )
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] inserted $[#${card.uid}] to ${name}${extra}`,
        game,
        client.uid
    ); else {
        return {good:false}
    }
    return {good:true}
})

server.setClientResponder('chatfc',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let game = client.inRooms[0].game;
    msgAll(
        client.inRooms[0].players,
        data.from,
        data.body,
        game
    )
    return {good:true}
})
server.setClientResponder('shakeCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    client.inRooms[0].forward(client, 'shake',data);
    return true;
})
server.setClientResponder('noteCard',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    let {uid,note} = data;
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1  
    let card = game.find(uid)
    if ( game.ownerOf(card)!= pnum) return  {good:false,details:'This is not your card'};
    card.notes[0] = note;
    if (!data.silent)   msgAll(
        client.inRooms[0].players,
        -1,
        (note && note.length) ? `$[@${client.uid}]  added note to $[#${uid}]: <br> ""${note}""`: `$[@${client.uid}]  removed note from $[#${uid}]`,
        game,
        client.uid
    );
    return true
})
server.setClientResponder('signalRoom',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    client.inRooms[0].forward(client, 'signal',data);
    return true;
})
server.setClientResponder('catchup',(client,data)=>{
     if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1      
    client.issues = false 
    msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}]  connected from a new device!`,
        game
    )
    return {
        good:true,
        game: game.exportFor(pnum),
        players:client.inRooms[0].players,
        pinfo: client.inRooms[0].players.map(id=>{
            let res = {}
            if (userCache[id]) {
                res.pfp = userCache[id].profileImage;
                 res.name = userCache[id].name
            }
            return res;
        })
    }
})
server.setClientResponder('rollDice',(client,data)=>{
     if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] rolled a 20-sided di and got a ${randInt(20)+1}`,
        game,
        client.uid

    )   
})
server.setClientResponder('shuffle',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let name = data.name
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    let zone = game[`player${pnum}`][name];
    shuffle(zone);
    zone.forEach(c=>c.revealed = [0,0])
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] shuffled ${name}`,
        game,
        client.uid

    )
})
server.setClientResponder('addZone',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let name = data.name
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    game.addZone(game[`player${pnum}`],name)
    if (!data.silent) msgAll(
        client.inRooms[0].players,
        -1,
        `$[@${client.uid}] created new zone: ${name}`,
        game,
        client.uid

    )
})
server.setClientResponder('topCardAttachedTo',(client,data)=>{
    if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
    console.log(client.uid,data) 
    let uid = data.uid;
    let game = client.inRooms[0].game;
    let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
    let card= game.find(uid).attached[0]
    if (!card) return {};
    return {
        name: card.revealed[pnum-1] ? card.name : 'a card',
        uid: card.uid
    }
})


showpairs.forEach(pr=>{
    server.setClientResponder(pr[0],(client,data)=>{
        if (client.state != 'ingame' || !client.inRooms.length) return  {good:false,details:'Client is not in a game!'}
        console.log(client.uid,data) 
        let uid = data.uid;      
        let game = client.inRooms[0].game;
        let pnum = client.inRooms[0].players.findIndex(uid=>uid==client.uid)+1    
        game.find(uid).revealed = pr[1](pnum)  
        if (!data.silent) msgAll(
            client.inRooms[0].players,
            -1,
            `$[@${client.uid}] is showing $[#${uid}] to: ${pr[2]}`,
            game,
            client.uid
        )
        return {good:true}
    })
})