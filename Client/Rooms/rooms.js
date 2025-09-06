let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "r_";
let id = s => document.getElementById(prefix + s)
let deb = false;
/////////////////////////////
import {fetchActiveUser} from '../fau.js'
import { Announcer } from '../announcer.js';
import { Connection } from '../clientside.js';
let announcer = new Announcer('msgr')
let connection =  false
let open = false
let [userId, session] =  [window.localStorage.getItem('userId'),window.localStorage.getItem('session')];
async function main(){
    let user = await fetchActiveUser()
    if (!user) return announcer.announce("Error- please login to continue!",1000000,['rd'])

    connection = new Connection(window.location.host,`${userId}`,{session})

    connection.onAuthFailError = ()=> announcer.announce('Auth Failure- Try logging back in',1000,['rd']);
    connection.onBadReqError = ()=> announcer.announce('Bad / Double Request- You may be connected elsewhere',1000,['rd']);

    connection.onStart = ()=> open = true
    connection.setResponder('gameType',(data)=>{
        if (id('standard').checked) return 0;
        return 1;
    })
    connection.setResponder('matchFound',(data)=>{
        window.location.assign(`/game?rid=${data.roomId}&opp=${data.other}&gt=${data.gameType}`);
        return true;
    })

}main();

id('newRoom').onclick = ()=>{
    if (!connection || !open || deb) return announcer.announce('Server busy - please wait!', 5, ['yel'])
    connection.request('newRoom',{userId,session},(data)=>{
        if (data.roomCode) {
            document.body.insertAdjacentHTML("beforeend",
                `<div class="overlay">
                    <div class = "twc gbg" style='width:70vw; height: 70vh; background-color: rgb(100,160,220); box-shadow: 0px 0px 2px black; border-radius:4vh;'>
                        <center>
                        <h2>Room Code: ${data.roomCode}</h2>
                        <p>Send the code to your friend so they can join!</p>
                        <br><br>
                        <button id='r_cancel'>Cancel</button>
                        </center>
                    </div>
                </div>`
            )     
            id('cancel').onclick= ()=>window.location.reload()
            
        }else {
            announcer.announce(data.details,5,['rd'])
        }
    
    })
}

id('joinRoom').onclick = ()=>{
    let roomCode = id('roomCodeIn').value
    if (!connection || !open || deb) return announcer.announce('Server busy - please wait!', 5, ['yel'])
    connection.request('joinRoom',{userId,session,roomCode},(data)=>{
        
    })
}
import { genFire } from '../campfire.js';
genFire(id('fdiv'),0.25,8)
