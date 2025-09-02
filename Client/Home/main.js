let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "h_";
let id = s => document.getElementById(prefix + s)
let deb = false;
//////////////////////////////////////////////////////
import {Announcer} from './announcer.js'
let announcer = new Announcer("rhrheje");
id('deck').onclick = (e) => e.ctrlKey ? window.open('/build') : window.location.replace('/build');
id('play').onclick = (e) => e.ctrlKey ? window.open('/play') : window.location.replace('/matchmaking');
id('room').onclick = (e) => e.ctrlKey ? window.open('/rooms') : window.location.replace('/rooms');


let [userId, session] =  [window.localStorage.getItem('userId'),window.localStorage.getItem('session')];

console.log(window.localStorage.getItem('userId'),window.localStorage.getItem('session'));


