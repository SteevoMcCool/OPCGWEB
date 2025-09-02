let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "";
let id = s => document.getElementById(prefix + s)
/////////////////////////////////////////////////////////
import { fetchActiveUser } from '../fau.js';

let user;
async function main() {
    user = await fetchActiveUser()
    console.log(user)
    if (!user) window.location.replace('/login')
    id('username').innerHTML = user.name 
    id('userId').innerHTML = `id: ${user.id}` 
    id('email').innerHTML = user.email 
}

let deb = false
id('logout').onclick = async function(){
    if (deb) return true;
    deb = true;
    let res = await fetch('/logoutep',{
        method:'post',
        body: JSON.stringify({id:user.id, session:user.session})
    })
    let resj = await res.json();
    if (resj.good) window.location.replace("/login")
    else document.body.insertAdjacentHTML('beforeend','<p>An error occured!</p>')
    deb = false;
}
main()