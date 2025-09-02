let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "u_";
let replacing = params.get('replacing')

let id = s => document.getElementById(prefix + s)
/////////////////////////////////////////////////////////
import {} from "./colorselect.js"
import { Announcer } from "./announcer.js";
import {fetchActiveUser} from "../fau.js"
let announcer = new Announcer('sjdbd');
let validCardTypes = ['Leader','Stage','Event','Character']
function upperFirstLetter(s=""){
    return s[0].toLocaleUpperCase() + s.substring(1).toLocaleLowerCase()
}
let colnames = ["Red","Yellow","Green","Blue","Purple","Black"]
function colArrToString(arr = [0,0,0,0,0,0]){
    arr = arr.map((o,i) => o ? colnames[i] : 0)
    return arr.filter(col => col).join('/')
}
function stringToColArr(str = ""){
    let arr = [0,0,0,0,0,0]
    str.split('/').forEach(x=> arr[colnames.indexOf(x)] = 1)
    return arr
}

let numImgInputs = 0;
id('addArt').onclick = ()=>{
    id('imglinkHolder').insertAdjacentHTML('afterbegin', 
    `<div id="u_dim${numImgInputs}">
        <input id="u_img${numImgInputs}" class="imgup" placeholder="https://onepiece-cardgame.dev/images/cards/ST01-001_85f00c_jp.jpg">
        <button id="u_cls${numImgInputs}">X</button>
    </div>`
    )
    let x = numImgInputs
    id(`cls${numImgInputs}`).onclick = ()=>  id(`dim${x}`).remove()
    numImgInputs++;

}

let custom = false
id('cus').style.opacity = '0.4'
id('cus').onclick = ()=>{
    id('cus').style.opacity = '1';
    id('off').style.opacity = '0.4'
    custom = true;
}
id('off').onclick = ()=>{
    id('off').style.opacity = '1';
    id('cus').style.opacity = '0.4'
    custom = false;
}
let user = false;
let good = false;
async function main(){
   user = (await fetchActiveUser())
   if (!user) return announcer.announce("Error: You must login to use this feature",20000,['rd'])
    good = true
} main();
id('upbu').onclick = async function(){
    if (!good) return announcer.announce("Server Busy", 4, ['yel']);
    console.log(user);
    let imgs = Array.from(document.querySelectorAll('.imgup')).map(x=>x.value)
    let res = await fetch(replacing ? '/editep' : '/uploadep',{
        method:'POST',
        body: JSON.stringify({
            custom,
            name: id('name').value,
            set: id('set').value,
            iid: id('iid').value,
            type: id('type').value,
            class: id('class').value,
            power: id('power').value,
            cowpow: id('cowpow').value,
            text: id('text').value,
            color: colArrToString(id('colorSelect').ON),
            userId: user.id,
            session: user.session,
            cost: id('cost').value,
            uid: replacing,
            imgs
        })
    })
    let resj = await res.json()
    if (resj.good) {
        announcer.announce("Success! Card Uploaded",4, ['grn']);
        document.querySelectorAll('input').forEach(inp => inp.value = '');
    }else {
        announcer.announce(resj.details,1000, ['rd']);
    }
}

id('colorSelect').SETTO([0,0,0,0,0,0])

id('editbu').onclick = async function(){
    document.body.insertAdjacentHTML("beforeend",
        `<div class="overlay">
            <div class = "twc gbg cup" id='u_cup'>
                               
            </div>
        </div>`
    )
    let cards = await (await fetch(`/cardsby?user=${user.id}`)).json();
    cards.forEach(c=>{
       id('cup').insertAdjacentHTML('beforeend',`<a class = 'gbg' href='/upload?replacing=${c.uid}' style='background-image:url("${c.imgs[0]}");width:100px;height:140px;'><p>${c.name}</p></a>`) 
    })
    document.querySelector('.overlay').onclick = document.querySelector('.overlay').remove
}

if (replacing){
    document.body.insertAdjacentHTML('afterbegin',`<h2>WARNING - EDITING EXISTING CARD</h2>`)
    let ccList = (await (await fetch('./ccbase.json')).json()).filter(c => c.class) ;

    id('cus').onclick();
    let card = ccList[replacing];
    id('name').value = card.name
    id('set').value = card.set 
    id('iid').value = card.iid 
    id('cost').value = card.cost 

    id('type').value = card.type
    id('class').value = card.class
    id('power').value = card.power
    id('cowpow').value = card.cowpow
    id('text').value = card.text
    id('colorSelect').SETTO(stringToColArr(card.color))

    for (let i = 0 ; i <card.imgs.length;i++){
        id('addArt').onclick();
    }
    let i = 0;
    document.querySelectorAll('.imgup').forEach(inp=>{
        inp.value = card.imgs[i++]
    })
}