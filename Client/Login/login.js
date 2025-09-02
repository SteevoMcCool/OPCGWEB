let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "l_";
let id = s => document.getElementById(prefix + s)
let deb = false;
//////////////////////////////////////////////////////
import {Announcer} from './announcer.js'
let announcer = new Announcer("rhrheje");
async function login(email) {
    if (deb) return true;
    deb=true;
    let loginEV = new EventSource(`${host}/loginep?email=${email}`)
    loginEV.addEventListener('open',msg => console.log(msg))
    
    let waitingForConfirm=false
    loginEV.addEventListener('message',msg=>{
        let data = JSON.parse(msg.data);
        if (waitingForConfirm){
            if (!data.good) return announcer.announce(data.details, 4, ['rd']);
            window.localStorage.setItem('userId',data.details.userId);
            window.localStorage.setItem('session',data.details.session);
            window.location.replace(`/`);
        }else{
            if (!data.good) return announcer.announce(data.details, 9999999, ['rd']);
            announcer.announce(data.details,4,['grn']);
            waitingForConfirm = true;
            id('main').innerHTML = `
                <h2>Keep this tab OPEN.</h2>
                <i>Please check your email for a login link from our 'SteveIsRad' email bot.
                Once clicked, this page will auto-update and you will be logged in.</i>
            `
        }
    })


}

id('loginbu').onclick = ()=> login(id('email').value)

