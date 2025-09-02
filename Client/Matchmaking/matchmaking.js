let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "m_";
let id = s => document.getElementById(prefix + s)
let deb = false;
////////////////////////////////////////////////
import {sleep,ERRORCODES,Connection} from '../clientside.js'
import {} from './clock.js'
import { Announcer } from '../announcer.js';
let announcer = new Announcer('msgr')
let [userId, session] =  [window.localStorage.getItem('userId'),window.localStorage.getItem('session')];

let now = Date.now()
let connection = new Connection(window.location.host,`${userId}`,{session})

connection.onAuthFailError = ()=> announcer.announce('Auth Failure- Try logging back in',1000,['rd']);
connection.onBadReqError = ()=> announcer.announce('Bad / Double Request- You may be connected elsewhere',1000,['rd']);

connection.onStart =  async () => {
    console.log(`${Date.now() - now}ms`)

    let estWait = await connection.promise('joinMatchmaking')
    if (estWait) {
        console.log(`${Date.now() - now}ms`)
        document.querySelector('.clock').START()
        id('estWait').innerHTML = `Est Wait ${Math.floor(estWait/60)}:${(estWait%60>9)? (estWait%60): `0${estWait%60}` }`
    }else{
        console.log("AAAH")
    }
};
connection.setResponder('matchFound',(data)=>{
    window.location.assign(`/game?rid=${data.roomId}&opp=${data.other}`);
    return true;
})

id('cancel').onclick = ()=>window.location.assign('/')