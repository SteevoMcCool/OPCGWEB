let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "d_";
let id = s => document.getElementById(prefix + s)
/////////////////////////////////////////////////////////
import { Announcer } from './announcer.js';
import {} from './colorselect.js'
import { fetchActiveUser } from '../fau.js';

let announcer = new Announcer()
let cardList = (await (await fetch('./cardbase.json')).json()).filter(c => c.class || 1) 
let ccList = (await (await fetch('./ccbase.json')).json()).filter(c => c.class || 1) ;
console.log(cardList.concat(ccList))
function getCard(uid,custom){
    if (Number(custom)) return ccList[uid];
    return cardList[uid]
}

cardList.forEach(c => c.has = (str)=>{ 
    str = str.toLowerCase();
    return  c.name.toLowerCase().includes(str) 
    ||      c.type.toLowerCase().includes(str) 
    ||      c.class.toLowerCase().includes(str)
})
ccList.forEach(c => c.has = (str)=>{ 
    str = str.toLowerCase();
    return  c.name.toLowerCase().includes(str) 
    ||      c.type.toLowerCase().includes(str) 
    ||      c.class.toLowerCase().includes(str)
})
let colnames = ["Red","Yellow","Green","Blue","Purple","Black"]

function colArrToString(arr = [0,0,0,0,0,0]){
    arr.map((o,i) => o ? colnames[i] : 0)
    return arr.filter(col => col).join('/')
}
function stringToColArr(str = ""){
    let arr = [0,0,0,0,0,0]
    str.split('/').forEach(x=> arr[colnames.indexOf(x)] = 1)
    return arr
}

function oversets(boolArr1, boolArr2) { //true if: for every TRUE in boolArr2, the corresponding spot in boolArr1 is TRUE
    let good = true
    boolArr2.forEach((b,i) => b ? good = good & boolArr1[i] : 0)
    return good
}


let types = ['Leader','Character','Event','Stage']

let x = 0

let currDeck = [];  //list of {count:num, uid:num, art:num,custom:bool}
let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_.";
function cardMetaToString(cm){
    return alphabet[cm.count] + alphabet[cm.art] 
    + alphabet[Math.floor(cm.custom*1 || 0)]   
    + alphabet[Math.floor(cm.uid / (64*64*64*64)) % 64]
    + alphabet[Math.floor(cm.uid / (64*64*64)) % 64]
    + alphabet[Math.floor(cm.uid / (64*64)) % 64]
    + alphabet[Math.floor(cm.uid / (64)) % 64]
    + alphabet[cm.uid  % 64]
}
function deckToString(deck,leader) {
    let sf='';
    deck.forEach(cm => sf +=cardMetaToString(cm))
    if (leader) sf += "a" + alphabet[leader.art]  
    + alphabet[Math.floor(leader.custom*1 || 0)]   
    + alphabet[Math.floor(leader.uid / (64*64*64*64)) % 64]
    + alphabet[Math.floor(leader.uid / (64*64*64)) % 64]
    + alphabet[Math.floor(leader.uid / (64*64)) % 64]
    + alphabet[Math.floor(leader.uid / (64)) % 64]
    + alphabet[leader.uid  % 64];
    return sf;
}
function deckToText(deck,leader){
    let card = getCard(leader.uid,leader.custom)
    let sf = (leader) ? `1x ${card.set}-${card.iid} (L)\n` :''
    deck.forEach(cm=>sf += `${cm.count}x ${getCard(cm.uid,cm.custom).set}-${getCard(cm.uid,cm.custom).iid}\n`)
    return sf;
}
function stringToDeck(str){
    let deck = []
    let lead = false
    for (let i = 0; i < str.length; i+=8){
        let count = alphabet.indexOf(str[i]);
        let art = alphabet.indexOf(str[i+1]);
        let custom = alphabet.indexOf(str[i+2]);
        let id16777216 = alphabet.indexOf(str[i+3])
        let id262144 = alphabet.indexOf(str[i+4]);
        let id4096 = alphabet.indexOf(str[i+5]);
        let id64 = alphabet.indexOf(str[i+6]);
        let idu = alphabet.indexOf(str[i+7]);
        let uid = id16777216*16777216 + id262144*262144 + id4096*4096 + id64*64+ idu 
        if (count) deck.push({count,uid,art,custom})
        else lead = {uid,art,custom}
    }
    return {deck, lead}
}
function addCardToDeck(uid,art,cus){
    let i = currDeck.findIndex(c=> c.uid == uid && c.custom == cus);
    if (i == -1) { 
        currDeck.push({count:1,uid,art,custom:cus*1});  
        return currDeck = currDeck.sort((a,b) => getCard(a.uid,a.custom).cost - getCard(b.uid,b.custom).cost);
    }
    currDeck[i].count++;
    currDeck[i].art = art;
}

function remCardFromDeck(uid,art,custom){
    let i = currDeck.findIndex(c=> c.uid == uid && c.custom == custom)
    if (i == -1) return false;
    if (currDeck[i].count == 1){
        currDeck = currDeck.filter(c => c.uid != uid || c.custom != custom )
        return true;
    }
    else currDeck[i].count--;
    return false;
}
function numCardInDeck(uid,custom){
    let i = currDeck.findIndex(c=> c.uid == uid && c.custom==custom);
    if (i == -1) return 0;
    return currDeck[i].count;
}
let currLeader =  false //obj of {uid:num, art:num,custom:bool}

cardList.forEach(c => c.color ? 0 : x++)
console.log(x)
let cw = id('colorSelect')


let onNumberPress = ()=>{};

let filters =  [
  c => oversets(cw.ON, stringToColArr(c.color)), 
  c => c.has(id('sbar').value)
]

class aFilter {
    constructor(type ="mustBeLeader", inverted=false){
        this.type = type
        this.inverted= false
        this.DOM = (()=>{
            id("searchzone").insertAdjacentHTML("beforeend",
            `
                <div class = "filter ${type}" style='position:relative;top:0px'>
                    <div class= "switch">
                        <button> </button>
                    </div>
                    <div class = "mainpart">
                        ${
                         (x=>{switch (type){
                            case 'mustBeLeader': return "Must Be: <br> LEADER";
                            case 'mustBeCharacter': return "Must Be: <br> CHARACTER"; 
                            case 'mustBeEvent': return "Must Be: <br> EVENT" ; 
                            case 'mustBeStage': return"Must Be: <br> STAGE" ; 
                            case 'inCardText': return "<div class='mainpartTop'>In Text:</div> <input id='d_inTextIn'>" 
                            case 'inCardClass': return "<div class='mainpartTop'>In Types:</div> <input id='d_inClassIn'>" 
                            case 'inCardSet':return "<div class='mainpartTop'>In Set:</div> <input id='d_inSetIn' style='width:4em'>" 
                            case 'counterPower': return `<div class='mainpartTop'>Co. Pow:</div> 
                            <div class='bflexbox'>
                                <div> <p style='margin:0px'>0</p><input type='checkbox' id='d_cop0k' checked=true> </div>
                                <div> <p style='margin:0px;padding-right:3px;'>1000 </p><input type='checkbox' id='d_cop1k'> </div>
                                <div> <p style='margin:0px'>2000</p><input type='checkbox' id='d_cop2k'> </div>
                            </div>`
                            case 'cost': return `<div class='mainpartTop'>Cost: <br> <input type='number' id='d_csmin' value='0'>-<input type='number' id='d_csmax' value='10'> </div> `
                            case 'power': return `<div class='mainpartTop'>Power: <br> <input type='number' id='d_pwmin' value='0' >-<input type='number' id='d_pwmax' value='14'>k </div> `

                        }})()   
                        }
                    </div>
                </div>
            `);
            
            return id('searchzone').querySelector(`.${type}`)
        })()
                console.log(this.DOM)

        switch (type) {
            case 'mustBeLeader': this.f= (c)=> c.type == "Leader" ^ this.inverted ; break;
            case 'mustBeCharacter': this.f= (c)=> c.type == "Character" ^ this.inverted ; break;
            case 'mustBeEvent': this.f= (c)=> c.type == "Event" ^ this.inverted ; break;
            case 'mustBeStage': this.f= (c)=> c.type == "Stage" ^ this.inverted ; break;
            case 'inCardText': {
                this.f= (c)=> c.text.toLowerCase().includes( id('inTextIn').value.toLowerCase()) ^ this.inverted ; 
                id('inTextIn').oninput = (e) => loadCards()
            }
            break;
            case 'inCardClass': {
                this.f= (c)=> c.class.toLowerCase().includes( id('inClassIn').value.toLowerCase()) ^ this.inverted ; 
                id('inClassIn').oninput = (e) => loadCards()
            } break;
            case 'inCardSet':{
                this.f= (c)=> c.set.toLowerCase().includes( id('inSetIn').value.toLowerCase()) ^ this.inverted ; 
                id('inSetIn').oninput = (e) => loadCards()
            } break;
            break;
            case 'counterPower': {
                this.f = (c)=> {
                    for (let i = 0; i < 3; i++) if (c.cowpow == (i * 1000) && id(`cop${i}k`).checked ) return !this.inverted

                    return this.inverted
                }
                for (let i = 0; i < 3; i++) id(`cop${i}k`).oninput = (e) => loadCards()
            } break;
            case 'cost': {
                    this.f = (c)=>  (id('csmin').value <= c.cost &&  c.cost <= id('csmax').value) ^ this.inverted
                    id('csmin').oninput = () => loadCards()
                    id('csmax').oninput = () => loadCards()

            } break;
            case 'power': {
                    this.f = (c)=>  (id('pwmin').value <= c.power/1000 &&  c.power/1000 <= id('pwmax').value) ^ this.inverted
                    id('pwmin').oninput = () => loadCards()
                    id('pwmax').oninput = () => loadCards()

            } break;
        }

        this.DOM.querySelector('.switch').onclick = () => this.invert()
        if (inverted) this.invert();

        this.DOM.onmouseenter = ()=>{
            this.DOM.insertAdjacentHTML('beforeend',`
                <button class='X' style='position:absolute; top:-0.85em; right:-0.85em;font-size:0.8em; 
                background-color:red; border-radius:100%; padding:1px 4px'>X</button>   
            `)
            this.DOM.querySelector('.X').onclick = ()=>remFilter(this.type)
        }
        this.DOM.onmouseleave = ()=>{
            if (this.DOM.querySelector('.X')) this.DOM.querySelector('.X').remove();
        }

    }
    invert() {
            this.inverted = !this.inverted;
            this.DOM.querySelector('.switch').querySelector('button').style.top = `${100* this.inverted}%`
            this.DOM.querySelector('.switch').style.backgroundColor = `rgb(${220* this.inverted},0,0)`
            switch (this.type){
            case 'mustBeLeader':
                this.DOM.querySelector('.mainpart').innerHTML = 
                `Must${this.inverted ? `<span style='color:rgb(220,0,0)'> Not </span>`  :" "}Be: <br> LEADER` ; 
                break;
            case 'mustBeCharacter': 
                this.DOM.querySelector('.mainpart').innerHTML = 
                `Must${this.inverted ? `<span style='color:rgb(220,0,0)'> Not </span>`  :" "}Be: <br> CHARACTER` ; 
                break;
            case 'mustBeEvent':
                this.DOM.querySelector('.mainpart').innerHTML = 
                `Must${this.inverted ? `<span style='color:rgb(220,0,0)'> Not </span>`  :" "}Be: <br> EVENT` ; 
                break;
            case 'mustBeStage': 
                this.DOM.querySelector('.mainpart').innerHTML = 
                `Must${this.inverted ? `<span style='color:rgb(220,0,0)'> Not </span>`  :" "}Be: <br> STAGE` ; 
                break;
            case 'inCardText':              
             this.DOM.querySelector('.mainpartTop').innerHTML = 
                `${this.inverted ? `<span style='color:rgb(220,0,0)'>Not </span>`  :""}In Text:` ; 
                break;
            case 'inCardClass':              
             this.DOM.querySelector('.mainpartTop').innerHTML = 
                `${this.inverted ? `<span style='color:rgb(220,0,0)'>Not </span>`  :""}In Types:` ; 
                break;
            case 'inCardSet':
                this.DOM.querySelector('.mainpartTop').innerHTML = 
                `${this.inverted ? `<span style='color:rgb(220,0,0)'>Not </span>`  :""}In Set:` ; 
                break;               
            }

            
            loadCards()
        }
}

let addedFilters = [
    new aFilter()
]
function addFilter(type = "mustBeLeader",inverted=false){
    let cur = addedFilters.find(a => a.type == type);
    if (cur) cur.inverted == inverted ? 1 : cur.invert();
    else addedFilters.push(new aFilter(type,inverted))
    loadCards()
}
function hasFilter(type="mustBeLeader"){
    return addedFilters.find(a => a.type == type) ? 1 : 0
}
function remFilter(type="mustBeLeader") {
    let cur = addedFilters.find(a => a.type == type) 
    if (cur){
        cur.DOM.remove()
        addedFilters = addedFilters.filter(af => af != cur);
        loadCards()
    }
}

function loadCards(s = (a,b)=> a.cost - b.cost){
    console.log(cw.ON)
    
    let l = cardList.concat(ccList);
    filters.forEach((f)=> l = l.filter(c => f(c)) );
    addedFilters.forEach((af)=> l = l.filter(c => af.f(c)) );

    l = l.sort(s);
    let sf = "";
    console.log(l)
    l.forEach(c => {
        sf += 
        `
            <div style="background-image:url('${c.imgs[0]}')" id="${c.uid}-0-${c.custom*1 || 0}"> 

            </div>
        `
    })
    id('cardzone').innerHTML = sf;

    id('cardzone').querySelectorAll("div").forEach(cdiv=>{
        let uid = cdiv.id.split('-')[0]

        let art = cdiv.id.split('-')[1]
        let custom = cdiv.id.split('-')[2]
        let type = getCard(uid,custom).type
        cdiv.oncontextmenu = e =>{
            e.preventDefault();
            document.body.insertAdjacentHTML("beforeend",
                `<div class="overlay">
                    <div class = "twc gbg" style='width:62.5vh; height: 87.5vh; background-image: ${cdiv.style.backgroundImage}; border-radius:2.85vh;'>
                        <button style='position:absolute; top:-1em; left:-1em;font-size:2em; background-color:red; border-radius:100%; padding:2px 8px'>X</button>
                    </div>
                </div>`
            )
            document.querySelector('.overlay').onclick = ()=> document.querySelector('.overlay').remove()
            document.querySelector('.overlay').oncontextmenu = (e)=> e.preventDefault() + document.querySelector('.overlay').remove()


        }
        cdiv.onmouseenter = e =>{
            cdiv.innerHTML = `
                <button id='d_use'> ${type=="Leader" ? "Use": "+"} </button>
                <button id='d_inspect'> Inspect </button>
            `
        
            cdiv.querySelector('#d_use').onclick = e =>{
                if (type == "Leader") {
                    currLeader = {uid,art,custom};
                    cw.SETTO(stringToColArr(getCard(uid,custom).color))
                    addFilter("mustBeLeader",true)
                    id('sbar').value = ""
                    loadCards()
                    loadDeck()
                    
                }else {
                    addCardToDeck(uid,art,custom)
                    loadDeck()

                }
            };
            cdiv.querySelector('#d_inspect').onclick = cdiv.oncontextmenu
        }
        cdiv.onmouseleave = e => {
            cdiv.innerHTML = ``
        }

        
    })
}
function copyToClip(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        announcer.announce("Link Copied (Fallback)", 4, ['grn']);
    } catch (err) {
        announcer.announce("Copy failed", 4, ['red']);
        console.error(err);
    }
    document.body.removeChild(textarea);
}

let colors = ['150,0,0','200,190,0','0,150,0','0,0,150','120,0,120','50,50,50'];
function loadDeck() {
    let lcolors = [1,1,1,1,1,1];
    if (currLeader){
        let lcard = getCard(currLeader.uid,currLeader.custom)
        id('leaderzone').style.backgroundImage = `url('${lcard.imgs[currLeader.art]}')`
        lcolors = stringToColArr(lcard.color)
        let stops = []
        for (let i = 0; i < 6; i++) if (lcolors[i]) stops.push(`rgba(${colors[i]},1)`);
        id('deck').style.backgroundImage = `linear-gradient(90deg,${stops.join(",")})`
    }
    let sf = "";
    currDeck.forEach(_c => {
        let c = getCard(_c.uid,_c.custom)
        console.log(c)
        sf +=   `
            <div class='cardInMainDeck' style="background-image:url('${c.imgs[0]}');
                outline: ${oversets(lcolors,stringToColArr(c.color)) ? ';' : '2px solid rgb(255,0,0)'};

            " id="${c.uid}-0-${(c.custom||0)*1}-md"> 
                <div class='numInDeckDisplay' 
                style="
                    color: ${_c.count > 4 ? 'rgb(255,100,0)' : _c.count == 4 ? 'rgb(50,255,50)' : 'rgb(240,240,240)'};
                ">
                    ${_c.count}
                </div>
                <p style='font-size:0.6em'></p>
            </div>
        `
    })
    id('cid').innerHTML = `Main Deck: ${currDeck.reduce((a,b)=>a+b.count,0)}`
    id('maindeck').innerHTML = sf;
    id('maindeck').querySelectorAll('.cardInMainDeck').forEach(cdiv=> {
        cdiv.oncontextmenu = (e)=>{
            id('impCard').style.backgroundImage = '';
    id('cid').innerHTML = `Main Deck: ${currDeck.reduce((a,b)=>a+b.count,0)}`

            e.preventDefault();
            let [uid, art,custom] = cdiv.id.split('-')
            let x = remCardFromDeck(uid,art,custom);
            if (x) cdiv.remove()
            else{
                let ncid =  numCardInDeck(uid,custom)
                cdiv.querySelector(".numInDeckDisplay").innerHTML = ncid;
                if (ncid > 4)       cdiv.querySelector(".numInDeckDisplay").style.color = 'rgb(255,100,0)'
                else if (ncid == 4) cdiv.querySelector(".numInDeckDisplay").style.color =  'rgb(50,255,50)'
                else                cdiv.querySelector(".numInDeckDisplay").style.color =  'rgb(240,240,240)' 
            }
                id('cid').innerHTML = `Main Deck: ${currDeck.reduce((a,b)=>a+b.count,0)}`

        }
        cdiv.onmouseenter = () => {
            let [uid, art,cus] = cdiv.id.split('-')
            id('impCard').style.backgroundImage = `url(${getCard(uid,cus).imgs[art]})`
        }
        cdiv.onmouseleave = () => {
            id('impCard').style.backgroundImage = '';
        }
        cdiv. onclick= (e)=>{
            id('impCard').style.backgroundImage = '';
            e.preventDefault();
            let [uid, art,custom] = cdiv.id.split('-')
            addCardToDeck(uid,art,custom);
            let ncid =  numCardInDeck(uid,custom)
            cdiv.querySelector(".numInDeckDisplay").innerHTML = ncid;
            if (ncid > 4)       cdiv.querySelector(".numInDeckDisplay").style.color = 'rgb(255,100,0)'
            else if (ncid == 4) cdiv.querySelector(".numInDeckDisplay").style.color =  'rgb(50,255,50)'
            else                cdiv.querySelector(".numInDeckDisplay").style.color =  'rgb(240,240,240)';
            
            id('cid').innerHTML = `Main Deck: ${currDeck.reduce((a,b)=>a+b.count,0)}`

        }
    })
}
console.log("AAAH")
loadCards()

cw.onChange = () => loadCards()
id('sbar').oninput = () => loadCards()


let menuout = false
id('filter').onclick = function(){
    menuout = !menuout
    if (menuout){
        id('filter').innerHTML = `<div class='dropdown' style='z-index:4' id='d_fdropdown' style="padding:4px">
            <div class='bflexbox'> 
                <button id='d_addCsF'>Cost</button>  
                <button id='d_addPwF'>Power</button>
      
                <button id='d_addCoF'>CowPow</button>
            </div>
            <button id='d_addSeF'>Search Card Set</button>
            
            <button id='d_addTyF'>Search Card Types</button>
            <button id='d_addCtF'>Search Card Text</button>
            <div class="grid2x2">
                <button id='d_addLeF'>Leader</button>
                <button id='d_addChF'>Character</button>
                <button id='d_addEvF'>Event</button>
                <button id='d_addStF'>Stage</button>
            </div>
        </div>`
        let canceling = false;
        
        id('fdropdown').onmouseleave = function(){
            canceling = setTimeout(()=>{
                    id('fdropdown').remove();
                    menuout = false;
     
            },250)
        }
        id('fdropdown').onmouseenter = function(){
            if (canceling)   canceling.close()
        }
        id('addPwF').onclick = () => hasFilter('power') ? remFilter('power') : addFilter('power');
        id('addCsF').onclick = () => hasFilter('cost') ? remFilter('cost') : addFilter('cost');
        id('addCoF').onclick = () => hasFilter('counterPower') ? remFilter('counterPower') : addFilter('counterPower');

        id('addLeF').onclick = () => hasFilter('mustBeLeader') ? remFilter('mustBeLeader') : addFilter('mustBeLeader');
        id('addChF').onclick = () => hasFilter('mustBeCharacter') ? remFilter('mustBeCharacter') : addFilter('mustBeCharacter');
        id('addEvF').onclick = () => hasFilter('mustBeEvent') ? remFilter('mustBeEvent') : addFilter('mustBeEvent');
        id('addStF').onclick = () => hasFilter('mustBeStage') ? remFilter('mustBeStage') : addFilter('mustBeStage');
        id('addSeF').onclick = () => hasFilter('inCardSet') ? remFilter('inCardSet') : addFilter('inCardSet');
        id('addCtF').onclick = () => hasFilter('inCardText') ? remFilter('inCardText') : addFilter('inCardText');
        id('addTyF').onclick = () => hasFilter('inCardClass') ? remFilter('inCardClass') : addFilter('inCardClass');

    }else id('filter').innerHTML = '';

}
id('share').onclick = ()=> {
      document.body.insertAdjacentHTML("beforeend",
        `<div class="overlay">
            <div class = "twc gbg bflexbox" style='width:62.5vh; height: 87.5vh; background-color:rgb(220,180,150); border-radius:2.85vh; flex-direction:column; justify-content: space-around;'>
                <button class='exit' style='position:absolute; top:-1em; left:-1em;font-size:2em; background-color:red; border-radius:100%; padding:2px 8px'>X</button>
                <button id='d_copyLink' style='font-size:2em;border-radius:50px;'>Copy Link</button>
                <button id='d_copyText'  style='font-size:2em;border-radius:50px;'>Copy Text</button>
                <button id='d_copyImage'  style='font-size:2em; border-radius:50px;'>Copy Image</button>
                <br>
                <button id='d_close'  style='font-size:2em; background-color:red'>Cancel</button>


            </div>            
        </div>`
    )
    let exit = document.querySelector('.overlay').querySelector('.exit');
    exit.onclick = ()=> document.querySelector('.overlay').remove()
    id('copyLink').onclick = ()=> copyToClip(`${host}/cbuild?ld=${deckToString(currDeck,currLeader)}`) + exit.onclick();
    id('copyText').onclick = ()=> copyToClip(deckToText(currDeck,currLeader)) + exit.onclick();
    id('copyImage').onclick = ()=> {
        announcer.announce("Not Implemented Yet",4,['yel']);
        exit.onclick()     
    }
    id('close').onclick =  exit.onclick;
}



id('import').onclick = () => {
    announcer.announce("Not Implemented Yet",4,['yel']);
}
id('sbu').onclick = () => announcer.announce("Please Login To Save Your Deck to Your Account! Click 'SHARE' to copy deck text.", 8, ['rd']);

async function main(){

    if (params.get('ld')) {
        let x = stringToDeck(params.get('ld'))
        currDeck = x.deck; currLeader = x.lead;
        remFilter('mustBeLeader')
        loadDeck()
    }


    let user = await fetchActiveUser()
    if (user){
        let sf = '';
        user.decks.forEach( (deck,i) =>{
            if (!deck) return 1;
            let [name,cus,str] = deck.split(',')
            console.log(deck,name,cus,str)
            let {lead,x=deck} = stringToDeck(str);
            if (!lead) lead = x[0]
            console.log(lead)
            if (!Number(cus)){
                   sf += `
                <div id='deckSlot${i}'>
                    <center>
                    <div class='captian gbg' style='background-color:rgb(200,200,200); display:block' href='./build?fcu=${i}'>
                        <span style='font-size:0.75em'>
                        ERROR LOADING IMAGE <br><br>
                        Deck may be for a different format
                        </span>
                    </div>
                    </center>
                </div>
            `     
            }else{
                sf += `
                    <div id='deckSlot${i}'>
                        <center>
                        <a class='captian gbg' style='background-image:url("${getCard(lead.uid,lead.custom).imgs[lead.art]}"); display:block' href='./cbuild?fcu=${i}'>
                        </a>
                        <input id=dname${i} value='${name}'>
                        </center>
                    </div>
                `
            }

        })
        id('choose').innerHTML = sf;

        id('sbu').onclick = () => {
            document.body.insertAdjacentHTML("beforeend",
                `<div class="overlay">
                    <div class = "twc gbg" style='width:87.5vh; height: 62.5vh; background-color:rgb(100,220,100); border-radius:2.85vh;'>
                        <center>    
                        <h2>Save Deck</h2>
                        <div class = 'bflexbox' style='justify-content:space-around'>
                            <div id='saveIn1' class='saveIn '>
                                <h3>Slot 1</h3>
                                ${user.decks.length > 0 ? `Currently: ${user.decks[0].split(',')[0]}`:`<i>Empty</i>`}
                            </div>
                            <div id='saveIn2' class='saveIn'>
                                <h3>Slot 2</h3>
                                ${user.decks.length > 1 ? `Currently: ${user.decks[1].split(',')[0]}`:`<i>Empty</i>`}
                            </div>
                            <div id='saveIn3' class='saveIn'>
                                <h3>Slot 3</h3>
                                ${user.decks.length > 2 ? `Currently: ${user.decks[2].split(',')[0]}`:`<i>Empty</i>`}
                            </div>
                        </div>
                        <br>
                        <input id='d_iname' placeholder='My Deck'>
                        <button id= 'd_savedeckbu'>Confirm Save</button> 

                        <br><br><br><br>
                        <button id='d_unOverlay'>CANCEL</button>
                        </center>
                    </div>
                </div>`
            )
            id('unOverlay').onclick = () => document.querySelector('.overlay').remove();
            document.querySelectorAll('.saveIn').forEach(s=>{
                s.onclick = function(){
                    let cur = document.querySelector('.saveSelected');
                    if (cur) cur.classList.remove('saveSelected')
                    s.classList.add('saveSelected')
                    if (s.innerText.includes('Empty') && !s.innerText.includes('Currently') ) id('iname').value = ''
                    else id('iname').value = s.innerText.split('Currently: ')[1]
                }
            })
            let deb = false
            id('savedeckbu').onclick = async () =>{
                if (deb) return announcer.announce('System still processing- please slow down', 4, ['yel'])    
                let cur = document.querySelector('.saveSelected');
                if (!cur) return announcer.announce('Error- Please select a save slot!', 4, ['rd'])  
                if (!currDeck.length) return announcer.announce('Error- This deck is empty!', 4, ['rd'])  
                deb = true
                let slot = cur.id.split("In")[1] - 1;
                let deckName = (id('iname').value && id('iname').value != '') ? id('iname').value : 'My Deck';
                let deckString = deckToString(currDeck,currLeader);
                let res = await fetch('/setDeck',{
                    method:'post',
                    body: JSON.stringify({id:user.id, session:user.session, slot,deckName,deckString,custom:true})
                })
                console.log("GOOD");
                let resj = await res.json();
                console.log(resj);
                deb = false
                announcer.announce(resj.details, 5, [(resj.good)? 'grn' : 'rd'])
                if (resj.good) window.location.replace(`/cbuild?fcu=${slot}`)
            }
        }

        if (params.get('fcu')){
            let x = stringToDeck(user.decks[params.get('fcu')].split(',')[2]);
            currDeck = x.deck; currLeader = x.lead;
            remFilter('mustBeLeader')
            loadDeck()           
        }
    }
}

main()