let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "g_";
let id = s => document.getElementById(prefix + s)
let deb = false;
////////////////////////////////////////////////
let usEZview = 'hand'
let oppEZview = 'hand'
let hoverCard = -1
let focusCard = false
let onNextInput = false
let nextInputCount = 1

function addUverlay(head,body,r=255,g=0,b=0){
    document.body.insertAdjacentHTML('beforeend',`
        <div class= 'uverlay' style='background-image: linear-gradient(rgba(${r},${g},${b},0.4),rgba(255,0,0,0),rgba(255,0,0,0));'>
            <h1>${head}</h1>
            <p>${body}</p>
        </div>
    `)
}
function rmeoveUverlay(){
    document.querySelectorAll('.uverlay').forEach(div => div.remove())
}
let busy = false
let expandedDeck = false
async function  nextInputCall(a1,a2,a3,a4) {
    if (busy && !deb) return  announcer.announce('Please wait! Server busy',4,['yel']);
    else if (busy) return ;
    busy = true
    deb = true;
    setTimeout(() => {
        deb = false
    },10);
    for (let i = 0; i < (nextInputCount||1); i++) {
        console.log(i,nextInputCount)

        if (onNextInput) await onNextInput(a1,a2,a3,a4);
    }
    busy = false
    onNextInput = false 
    rmeoveUverlay()
    nextInputCount = 1;
}
///////////////////////////////////////////////
function deprefix(k="unkind",pref='un') {
    if (k.substring(0,pref.length) == pref) return k.substring(pref.length)
    return k
}
const hiddenIconStr = `
  <div class="gbg" style="
    width: 24px; 
    height: 24px; 
    background-image: url('https://static.thenounproject.com/png/3855940-200.png');
    position: absolute;
    top: 0px;
    right: 0px;
    pointer-events: none;
  "></div>
`;
let gameType = params.get('gameType')
import {sleep,ERRORCODES,Connection} from '../clientside.js'
import {} from './clock.js'
import { Announcer } from '../announcer.js';
let announcer = new Announcer('msgr')
let [userId, session] =  [window.localStorage.getItem('userId'),window.localStorage.getItem('session')];

let now = Date.now()
let user = false;
let connection = new Connection(window.location.host,`${userId}`,{session, roomCode:params.get('rid')})
connection.onAuthFailError = ()=> announcer.announce('Auth Failure- Try logging back in',1000,['rd']);
connection.onBadReqError = ()=> announcer.announce('WARNING - You have another tab open in a game!',1000,['yel']);
let cardsInGame = [];
function gather(game){
    cardsInGame = []
    let p = [game.player1,game.player2]
    p.forEach(p=>{
        Object.values(p).forEach(zone=>{
            zone.forEach(c=>{
                cardsInGame[c.uid] = c;
                c.attached.forEach(c=>cardsInGame[c.uid] = c)
            })
        })
    })
}
function safeguard(f=async()=>{}){
    return async ()=>{
        if (busy) return false;
        busy = true;
        await f();
        busy = false;
    }

}
let lsl =  0;
function expandDeck(deck,name,us){
    expandedDeck = [us,name]
    document.querySelectorAll('.overlay').forEach(div=>div.remove())
    document.body.insertAdjacentHTML('beforeend',`
        <div class="overlay">
                    <button class='bigredX exit'>X</button>
                    <div class = "twc gbg expandedDeck">
                        <div id='g_edTop'>
                            ${name}
                            (${deck.length})
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            ${us ? `<button id='g_edra'>Reveal All</button>
                            <button id='g_edha'>Hide All</button>` : ''}
                        </div>
                        <div id='g_edBottom'></div>
                    </div>
                </div>
        `)
        document.querySelector('.bigredX').onclick = ()=>{
            expandedDeck = false
            lsl = 0;
            document.querySelector('.overlay').remove()
        }
    
    id('edBottom').addEventListener('scroll',()=>{
        lsl = id('edBottom').scrollLeft

    } )
    if (us) id('edra').onclick = ()=>{
        if (busy) return false;
        busy = true 
        connection.request('revealModeZone',{name,revealed:[1,1]},()=> busy = false)
    }

    if (us) id('edha').onclick = ()=>{
        if (busy) return false;
        busy = true 
        connection.request('revealModeZone',{name,revealed:[0,0]},()=> busy = false)
    }
    deck.forEach((card,i)=>{
            let tspot = i;
            id('edBottom').insertAdjacentHTML('beforeend', `
                <div class='card gbg' style="background-image:url('${card.image}')" id='g_ced_${card.uid}'>
                    ${card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : ""}
                    <p class='br'> ${tspot+1}</p>
                </div>
            `)
            let carddiv = id(`ced_${card.uid}`)
            carddiv.onmouseenter = ()=>{
                console.log('me')
                hoverCard = card.uid
                if (!us) return 0;
                carddiv.innerHTML += `
                    <div class = 'twc' style='width:100%;margin:0px; overflow-y:auto; '>

                            <div id='g_moveTo'>
                                <button id='g_moveToHand'>To Hand</button>
                                <button id='g_moveToPlay'>To Play</button>
                                <button id='g_moveToMain' name='mainDeck'>To Main</button>
                                <button id='g_moveToTrash' name='trash'>To Trash</button>
                                <button id='g_moveToLife' name='lifeDeck'To >Life</button>
                            </div>
                            <center id='g_pos'>
                                <button id='g_moveToTop'> << </button>
                                <button id='g_moveUp'> < </button>
                                <button id='g_moveDown'> > </button>
                                <button id='g_moveToBtm'> >> </button>
                            </center>
                            <br>
                    </div>
                        <div class='showModes' style='display:flex; width:100%;    justify-content: space-around;'> 
                                <button id='g_nthr' class ='emoji'style="background-image:url('https://i.ibb.co/Tx0J374D/eyesclosed.png')" ></button>
                                <button id='g_oyou' class='emoji' style="background-image:url('https://i.ibb.co/hxHH4D06/blueeyeopen.png')"></button>
                                <button id='g_oopp' class='emoji' style="background-image:url('https://i.ibb.co/Cpk12G8Q/redeyeopen.png')"></button>
                                <button id='g_allp' class='emoji' style="background-image:url('https://i.ibb.co/hxHH4D06/blueeyeopen.png'), url('https://i.ibb.co/Cpk12G8Q/redeyeopen.png')"></button>
                        </div>
                `


                id('moveToHand').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name: 'hand', spot: 0 }))
                id('moveToPlay').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name: 'characterZone', spot: 0 }))
                id('moveToTrash').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name: 'trash', spot: 0 }))
                id('moveToLife').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name: 'lifeDeck', spot: 0 }))
                id('moveToMain').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name: 'mainDeck', spot: 0 }))


                id('moveToTop').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name, spot: 0 }))
                id('moveUp').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name, spot: Math.max(0,tspot-1), revealed:card.revealed}))
                id('moveDown').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name, spot: Math.min(deck.length,tspot+1), revealed:card.revealed}))
                id('moveToBtm').onclick = safeguard(async () => await connection.promise('moveCard', { uid: card.uid, name, spot: deck.length })) 

                document.querySelectorAll('button').forEach(bu=>{
                    if (bu.name == name) bu.remove();
                })
                // Show mode handlers
                id('oyou').onclick = safeguard(async () => await connection.promise('oyou', { uid: card.uid }))


                id('oopp').onclick = safeguard(async () => await connection.promise('oopp', { uid: card.uid }))

                id('nthr').onclick = safeguard(async () => await connection.promise('nthr', { uid: card.uid }))


                id('allp').onclick = safeguard(async () => await connection.promise('allp', { uid: card.uid }))
            }
            carddiv.onmouseleave = ()=>{
                carddiv.innerHTML = (card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : "")  + `<p class='br'> ${tspot+1}</p>`
            }
        })
    id('edBottom') .scrollLeft = lsl
}   

function loadOurSide(game,us,opp) {
    let uspanel = id(`usPanel`)
    uspanel.innerHTML = ''

    for (let [k,v] of Object.entries(us)){
        let html = id(`us-${k}`)
        if (expandedDeck) {
            if (expandedDeck[0] == 1 && expandedDeck[1]==k) expandDeck(v,k,1)
        }
        //console.log(k,html)
        if (html) {
            if (k.toLocaleLowerCase().includes('deck') || k.toLocaleLowerCase().includes('trash')){   
                if (k.toLocaleLowerCase().includes('life')){
                html.innerHTML = `
                    <div  class='deck gbg' style="background-image:url('${v.length ? v[0].image : ''}'); transform: rotate(90deg)" id='g_d_${k}'>
                        <p class='br'> ${v.length}</p>
                    </div>
                `; 
                }else{
                html.innerHTML = `
                    <div  class='deck gbg' style="background-image:url('${v.length ? v[0].image : ''}')" id='g_d_${k}'>
                        <p class='br'> ${v.length}</p>
                    </div>
                `; 
                }

                id(`d_${k}`).onmouseenter = ()=>{
                    if (onNextInput) {
                                                console.log(k)

                        id (`d_${k}`).innerHTML = 
                            `
                                <button id='g_to_0' class='h'>Top</button>
                                <button id='g_to_${v.length}'  class='h'>Bottom</button>
                            `
                        id('to_0').onclick = ()=>{
                            console.log('clicktop')
                            nextInputCall({is:'Zone', spot: 0, name: k })
                        }
                        id(`to_${v.length}`).onclick = ()=>{
                            console.log('clickbtm')
                            nextInputCall({is:'Zone', spot: v.length, name: k })
                        }
                    }else{
                        id (`d_${k}`).innerHTML = 
                            `
                                <button id='g_movetop'>Move Top</button>

                                <button id='g_expand'>Expand</button>
                                <button id='g_shuffle'>Shuffle</button>
                            `
                        id(`movetop`).onclick = async ()=>{
                            if (!v.length) return announcer.announce(`${k} is empty`,4,['rd'])
                            await sleep(10);
                            document.querySelectorAll('.ourcard').forEach(card=>{
                                card.style.pointerEvents = 'none'
                            })
                            nextInputCount = 1
                            addUverlay(`Moving top <span class="boxed" id='g_r2num'>1</span> card(s) from ${k}`, "Click the area you wish to move it to or right click to cancel",20,100,220)
                            console.log("good")
                            let z = [v[0]]
                            let i = 0
                            onNextInput = async (data={})=>{
                                console.log(data)
                                if (i >=v.length) return announcer.announce(`${k} is empty`,4,['rd'])
                                if (data.is != 'Zone') return false;
                                                            document.querySelectorAll('.ourcard').forEach(card=>{
                                    card.style.pointerEvents = 'all'
                                })
                                ;
                                let res =  await connection.promise('moveCard',{uid:z[0].uid,name:data.name,spot:data.spot})
                                                                z[0] = v[++i]
                            }
                                                    console.log("good2")

                        }
                        id('expand').onclick = ()=> expandDeck(v,k,1)
                        id('shuffle').onclick = async ()=> {
                                                    ;
                            let res =  await connection.promise('shuffle',{name:k})
                            
                        }
                    }
                }
                id (`d_${k}`).onmouseleave = ()=>{
                    id (`d_${k}`).innerHTML = `<p class='br'> ${v.length}</p>`
                }
            }else{
                html.innerHTML = ''
                v.forEach(card=>{

                    html.insertAdjacentHTML('beforeEnd', `
                        <div class='card gbg ourcard' style="background-image:url('${card.image}')" id='g_c_${card.uid}'>
                            ${card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : "" /*DOESNT WORK*/} 
                            <div class='note'>${card.notes[0] || ''}</div>
                        </div>
                    `)
                    let ch = ''
                    let i = 2;
                    card.attached.forEach(ac => {
                        const xOffset = 5; // px right per attached card
                        const yOffset = 5;  // px down per attached card
                        const zOffset = -5; // px back per attached card (negative Z moves back)
                        ch += `
                            <div class='card gbg' style="
                                position: absolute;
                                transform: translate3d(${i * xOffset}px, ${i * yOffset}px, ${i * zOffset}px);
                                background-image:url('${ac.image}');
                                pointer-events:none
                            "
                             
                            id='g_c_${ac.uid}'
                            >
                            </div>
                        `;
                        i++;
                    });
                    id(`c_${card.uid}`).innerHTML += ch
                    if (!card.active) id(`c_${card.uid}`).style.transform = 'rotate(90deg)'

                })
            }
        }else{
            uspanel.insertAdjacentHTML(`beforeend`,`<button id='g_switchTo${k}'>${deprefix(k,'ez_')}  (${v.length})</button>`)
            if (k == usEZview) {
                let s = ''
                v.forEach(card=>{
                    s+= `
                        <div class='card gbg ourcard' style="background-image:url('${card.image}')" id='g_c_${card.uid}'>
                            ${card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : "" /*WORKS FINE*/}
                            <div class='note'>${card.notes[0] || ''}</div>
                        </div>
                    `
                })
                id('usEZ').innerHTML = s;
            }
            id(`switchTo${k}`).onmouseenter = function(){console.log('AAAAAAh')};
            id(`switchTo${k}`).onclick = function(){
                if (onNextInput) nextInputCall({name:k,is:'Zone'})
                usEZview = k;
                loadOurSide(game,us,opp)
            }
        }
    }

    uspanel.insertAdjacentHTML('beforeend',`
        <span style='padding: 0px 2px; background-color:gray'><input id='g_addZoneIn' style='width:5.7em;'><button id='g_addZoneBu' style='padding:0px'>+</button></span>    
    `)
    id('addZoneBu').onclick = ()=>{
        let name = id('addZoneIn').value 
        console.log(name)
        if (name.length < 2) return announcer.announce('Zone name must be at least 2 characters',4,['rd'])
        if (busy) return false;
        busy=true
        connection.request('addZone',{name},()=>{
            busy=false
        })
    }
    document.querySelectorAll('.ourcard').forEach(carddiv=>{
        let uid = Number(carddiv.id.split('c_')[1])
        let card = cardsInGame[uid]
        carddiv.onclick = ()=>{
            if (onNextInput) nextInputCall({uid})
        }
        carddiv.onmouseenter = ()=>{
            hoverCard = uid
                if (onNextInput) return false;

            carddiv.innerHTML += `
                <div class = 'twc options' style='width:100%;height:100%;margin:0px; overflow-y:auto'>
                    <center style='margin-top:10px'>
                        <button id='g_movecard'  class='big emoji' style='background-image:url("https://cdn-icons-png.flaticon.com/512/271/271222.png")'></button>
                        <button id='g_tapcard' class='big emoji' style="background-image:url('https://images.vexels.com/media/users/3/136745/isolated/preview/8f36b91326bec8f8100da818b58e20de-right-rotate-arrow.png')"></button>
                        <button id='g_attachcard' class='big emoji' style="background-image:url('https://i.ibb.co/Nd6cg2x6/IMG-5341-1.png');   "></button>
                    </center>
                    <div class='showModes' style='display:flex; width:100%;    justify-content: space-around;'> 
                            <button id='g_nthr' class ='emoji'style="background-image:url('https://i.ibb.co/Tx0J374D/eyesclosed.png')" ></button>
                            <button id='g_oyou' class='emoji' style="background-image:url('https://i.ibb.co/hxHH4D06/blueeyeopen.png')"></button>
                            <button id='g_oopp' class='emoji' style="background-image:url('https://i.ibb.co/Cpk12G8Q/redeyeopen.png')"></button>
                            <button id='g_allp' class='emoji' style="background-image:url('https://i.ibb.co/hxHH4D06/blueeyeopen.png'), url('https://i.ibb.co/Cpk12G8Q/redeyeopen.png')"></button>
                    </div>
                </div>

            `
            id('movecard').onclick = async ()=>{
                await sleep(10);
                document.querySelectorAll('.ourcard').forEach(card=>{
                    card.style.pointerEvents = 'none'
                })
                 nextInputCount = 1
                addUverlay(`Moving ${(card || {name:'a card'}).name}`, "Click the area you wish to move it to or right click to cancel" ,20,100,220)
                onNextInput = async (data={})=>{
                    console.log(data)
                    if (data.is != 'Zone') return false;
                                    onNextInput = false
                    document.querySelectorAll('.ourcard').forEach(card=>{
                        card.style.pointerEvents = 'all'
                    })
                    ;
                    let res =  await connection.promise('moveCard',{uid,name:data.name,spot:data.spot})
                    
                }
            }
            id('attachcard').onclick = async ()=>{
                await sleep(10);
                                        nextInputCount = 1
                addUverlay(`Attaching ${(card || {name:'a card'}).name}`, "Click the card you wish to attach it to or right click to cancel")

                onNextInput = async (data={})=>{
                    console.log(data)
                    if (data.is == 'Zone') return false;
                                    onNextInput = false

                    ;
                        let res =  await connection.promise('attachCard',{uid,adornee:data.uid})
                    
                }
           
            }
            id('tapcard').onclick = async ()=>{
                            ;
                let res =  await connection.promise('tapCard',{uid})
                
            }
            id('oyou').onclick = async ()=>{
                            ;
                let res =  await connection.promise('oyou',{uid})
                
            }
            id('oopp').onclick = async ()=>{
                            ;
                let res =  await connection.promise('oopp',{uid})
                
            } 
            id('nthr').onclick = async ()=>{
                            ;
                let res =  await connection.promise('nthr',{uid})
                
            }
            id('allp').onclick = async ()=>{
                            ;
                let res =  await connection.promise('allp',{uid})
                
            }
        }
        carddiv.onmouseleave = ()=>{
            carddiv.querySelector('.options').remove();
        }
    })


}
function loadOppSide(game,us,opp){
    let oppPanel = id(`oppPanel`)
    oppPanel.innerHTML = ''
    for (let [k,v] of Object.entries(opp)){
        let html = id(`opp-${k}`)
        if (expandedDeck) {
            if (expandedDeck[0] == 0 && expandedDeck[1]==k) expandDeck(v,k,0)
        }
        if (html) {
            if (k.toLocaleLowerCase().includes('deck') || k.toLocaleLowerCase().includes('trash')){   
                if (k.toLocaleLowerCase().includes('life')){
                html.innerHTML = `
                    <div  class='deck gbg' style="background-image:url('${v.length ? v[0].image : ''}'); transform: rotate(90deg)" id='g_d_${k}_o'>
                        <p class='br'> ${v.length}</p>
                    </div>
                `; 
                }else{
                html.innerHTML = `
                    <div  class='deck gbg' style="background-image:url('${v.length ? v[0].image : ''}')" id='g_d_${k}_o'>
                        <p class='br'> ${v.length}</p>
                    </div>
                `; 
                }
                id(`d_${k}_o`).onmouseenter = ()=>{
                    if (onNextInput) {
                        id (`d_${k}_o`).innerHTML = 
                            `
                                <button id='g_to_0' class='h'>Top</button>
                                <button id='g_to_${v.length}' class='h'>Bottom</button>
                            `
                        id('to_0').onclick = ()=>{
                            nextInputCall({is:'Zone', spot: 0, name: k })
                        }
                        id(`to_${v.length}`).onclick = ()=>{
                            nextInputCall({is:'Zone', spot: v.lengt, name: k })
                        }
                    }else{
                        id (`d_${k}_o`).innerHTML = 
                            `
                                <button id='g_expand'>Expand</button>
                            `
                        id('expand').onclick = ()=> expandDeck(v,k,0)

                    }
                }
                id (`d_${k}_o`).onmouseleave = ()=>{
                    id (`d_${k}_o`).innerHTML = `<p class='br'> ${v.length}</p>`
                }
            }else{
               html.innerHTML = ''
                v.forEach(card=>{
                    html.innerHTML+= `
                        <div class='card gbg oppcard' style="background-image:url('${card.image}')" id='g_c_${card.uid}'>
                            ${card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : ""}
                            <div class='note'>${card.notes[0] || ''}</div>
                        </div>
                    `
                    let ch = ''
                    let i = 2;

                    card.attached.forEach(ac => {
                        const xOffset = 5; // px right per attached card
                        const yOffset = -5;  // px down per attached card
                        const zOffset = -5; // px back per attached card (negative Z moves back)
                        ch += `
                            <div class='card gbg' style="
                                position: absolute;
                                transform: translate3d(${i * xOffset}px, ${i * yOffset}px, ${i * zOffset}px);
                                background-image:url('${ac.image}');
                            "
                             
                            id='g_c_${card.uid}'
                            >
                            </div>
                        `;
                        i++;
                    });
                    id(`c_${card.uid}`).innerHTML += ch
                    if (!card.active) id(`c_${card.uid}`).style.transform = 'rotate(90deg)'

                })
            }
        }else{
            oppPanel.insertAdjacentHTML(`beforeend`,`<button id='g_switchTo${k}_o'>${deprefix(k,'ez_')} (${v.length})</button>`)
            if (k == oppEZview) {
                let s = ''
                v.forEach(card=>{
                    s+= `
                        <div class='card gbg oppcard' style="background-image:url('${card.image}')" id='g_c_${card.uid}'>
                            ${card.revealed.reduce((a,b)=>a+b)==1 ? hiddenIconStr : ""}
                            <div class='note'>${card.notes[0] || ''}</div>
                        </div>
                    `
                })
                id('oppEZ').innerHTML = s;
            }
            id(`switchTo${k}_o`).onclick = function(){
                oppEZview = k;
                loadOppSide(game,us,opp)
            }
        }
    }

    document.querySelectorAll('.oppcard').forEach(carddiv=>{
        let uid = Number(carddiv.id.split('c_')[1])
        let card = cardsInGame[uid]
        carddiv.onmouseenter = ()=>{
                hoverCard = uid
                if (onNextInput) return false;
        }

    })
}
function setupBoard(game,order,updateps){
    let us = game.player2
    let opp = game.player1  

    if (order[0]==userId) us = game.player1, opp = game.player2;

    gather(game)

    if (updateps[order.findIndex(uid=>uid==userId)] ) loadOurSide(game,us,opp),  (nextInputCount <= 1) ?  onNextInput = false :0;
    if (updateps[order.findIndex(uid=>uid!=userId)]) loadOppSide(game,us,opp)
    document.querySelectorAll('.zone').forEach(zonediv=>{
        zonediv.onclick = ()=>{
            if (onNextInput) nextInputCall({name:zonediv.id.split('-')[1],is:'Zone'})
        }
    })
}
let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_.";


let cardList = (await (await fetch('./cardbase.json')).json())
let ccList = (await (await fetch('./ccbase.json')).json()) ;
console.log(cardList.concat(ccList))
function getCard(uid,custom){
    if (Number(custom)) return ccList[uid];
    return cardList[uid]
}
function readDeckMeta(str) {    
    let [name,cus,bstr] = str.split(',')
    console.log('abt to read: ',name,cus,bstr)
    let deckmeta = []
    let leadmeta = false
    if (Number(cus)) for(let i = 0; i < bstr.length;i+=8) {
        let count = alphabet.indexOf(bstr[i]);
        let art = alphabet.indexOf(bstr[i+1]);
        let custom = alphabet.indexOf(bstr[i+2]);
        let id16777216 = alphabet.indexOf(bstr[i+3])
        let id262144 = alphabet.indexOf(bstr[i+4]);
        let id4096 = alphabet.indexOf(bstr[i+5]);
        let id64 = alphabet.indexOf(bstr[i+6]);
        let idu = alphabet.indexOf(bstr[i+7]);
        let uid = id16777216*16777216 + id262144*262144 + id4096*4096 + id64*64+ idu 
        if (count) deckmeta.push({count,uid,art,custom})
        else leadmeta = {uid,art,custom}
    } else for (let i = 0; i < bstr.length; i+=6){
            let count = alphabet.indexOf(bstr[i]);
            let art = alphabet.indexOf(bstr[i+1]);
            let id262144 = alphabet.indexOf(bstr[i+2]);
            let id4096 = alphabet.indexOf(bstr[i+3]);
            let id64 = alphabet.indexOf(bstr[i+4]);
            let idu = alphabet.indexOf(bstr[i+5]);
            let uid = id262144*262144 + id4096*4096 + id64*64+ idu
            if (count) deckmeta.push({count,uid,art})
            else leadmeta = {uid,art}
    }
    return {name,deckmeta,leadmeta}
}
function promptDeckSelect(){
    let dstr = ''
    user.decks.forEach(deck=>{
        let {name,deckmeta,leadmeta} = readDeckMeta(deck)
        dstr +=`
            <div>
                <center>
                <h2>Deck: ${name}</h2>
                <button class='chooseDeck' id='g_choose_${name}'>Select </button>
                </center>
            </div>
        `

    })
    document.body.insertAdjacentHTML("beforeend",
    `<div class="overlay" id='g_deckSelect'>
        <div class = "twc gbg" style='width:70vw; height: 70vh; background-color: rgb(220,160,200); border-radius:4vh'>
            <br>
            <div class='dselmain'>
                ${dstr}
            </div>
            <br>
            <p>OR, paste link: <input id='g_decklink' placeholder='from this site only!'> <button id='g_lpaste'>Submit</button></p>
            <br>
            <button style='background-color:red; position:absolute; bottom:0px; left:50%;transform:translate(-50%,-50%)' id='g_exitds' class='exit'>EXIT</button>
        </div>
    </div>
    `)
    id('exitds').onclick = ()=> id('deckSelect').remove()
    user.decks.forEach(deck=>{
        let {name,deckmeta,leadmeta} = readDeckMeta(deck)
        id(`choose_${name}`).onclick = async ()=>{
            console.log(name,busy,deckmeta,leadmeta)
            if (busy) return false;
            ;
            let res =  await connection.promise('selectDeck',{deckmeta,leadmeta})
            
            if (!res) announcer.announce('Try again!',4,['rd'])
            id('deckSelect').remove()
        }
    })    
    id('lpaste').onclick = async function() {
            if (busy) return false;
            let decklink = id('decklink').value
            if (!decklink.includes(host)) return [busy=false,announcer.announce("Error: link must be from this site!",4,['rd'])];
            let [name,deckmeta, leadmeta]= readDeckMeta(decklink.split('ld=')[1].split('&')[0])
            ;
            let res =  await connection.promise('selectDeck',{deckmeta,leadmeta})
            
            if (!res) announcer.announce('Try again!',4,['rd'])
            id('deckSelect').remove()        
    }
}
connection.onStart =  async () => {
}

id('deckSelectBu').onclick = ()=>promptDeckSelect();
id('exitGame').onclick = async ()=>{
    let res = await connection.promise('exitRoomGracefully',{});
    if (res) window.location.replace('/')
     
}
id('rollDice').onclick = async ()=>{
    if (busy) return 1;
    ;
    await connection.promise('rollDice',{});
    
}
id('send').onclick = function() {
    let v = id('msg').value + ''
    if (v.length)connection.request("chatfc",{
        from: userId,
        body: v
    })
    setTimeout(()=>id('msg').value = '',1)
}
id('refreshAll').onclick = async function(){
    if (busy) return 1;
    ;
    await connection.promise('refresh',{});
    
}
id('searchCard').onclick = function(){
    document.body.insertAdjacentHTML('beforeend',`
        <div class="overlay" id='g_cardSearch'>
            <div class = "twc gbg" style='padding-left:0.5em;width:55vh; height: 70vh; background-color: rgb(50,100,190); border-radius:4vh;color:white'>
                <br>
                <span style='display:inline-block; width:3.7em'>Name:</span> <input id='g_nameinput'>
                <br>              
                <span style='display:inline-block;width:3.7em'>Set:</span> <input id='g_setinput'>
                <br>
                <span>Custom?</span> <input type=checkbox id='g_checkinput'>
                <br>
                <center> 
                    <button id='g_serbu'>Search</button> 
                    <div style='display:flex; height: calc(80% - 4em);overflow-x:auto;overflow-y:hidden' id='g_results'>

                    </div>
                    <button style='background-color:red; position:absolute; bottom:0px;transform:translate(-50%,-50%)' id='g_exitcs' class='exit'>EXIT</button
                </center>
            </div>

        </div>
    `)
    id('serbu').onclick = async ()=>{
        let name = id('nameinput').value 
        let set = id('setinput').value 
        let cus = id ('checkinput').checked 
        console.log(cus)
        if (name.length > 2 || set.length > 2){
            if (busy) return announcer.announce("Server busy",4,['yel'])
            
            let cards = await fetch(`/refinedCardSearch?set=${set}&name=${name}${cus? '&cus=1':''}`)
            
            cards = await cards.json()
            console.log(cards)
            id('results').innerHTML =''
            cards.forEach(card=>{
                id('results').insertAdjacentHTML('beforeend',`
                 <div id='g_sc_${card.uid}_${cus}' class='card gbg' style="background-image:url('${card.imgs[0]}'); display:flex; flex-direction:column-reverse;">
                        <button id='g_add2mdb_${card.uid}_${cus}'>Add to main deck bottom</button>
                        <button id='g_add2mdt_${card.uid}_${cus}'>Add to main deck top</button> 
                        <button id='g_add2play_${card.uid}_${cus}'>Add to play</button>
                        <button id='g_add2hand_${card.uid}_${cus}'>Add to hand</button> 
                 </div>   
                `)
                id(`add2mdb_${card.uid}_${cus}`).onclick =  async  ()=>{
                                    ;
                    await connection.promise('insertCard', { id: card.uid,cus, name: 'mainDeck', spot: 9999999});
                    
                    announcer.announce('Card Inserted!',4,['grn'])
                }
                id(`add2mdt_${card.uid}_${cus}`).onclick =  async ()=>{
                                    ;
                    await connection.promise('insertCard', { id: card.uid,cus, name: 'mainDeck', spot: 0});
                    
                        announcer.announce('Card Inserted!',4,['grn'])

                }
                id(`add2play_${card.uid}_${cus}`).onclick =  async ()=>{
                                    ;
                    await connection.promise('insertCard', { id: card.uid,cus, name: 'characterZone', spot: 0});
                    
                        announcer.announce('Card Inserted!',4,['grn'])
            
                }
                id(`add2hand_${card.uid}_${cus}`).onclick = async  ()=>{
                                    ;
                    await connection.promise('insertCard', { id: card.uid,cus, name: 'hand', spot: 0});
                    
                        announcer.announce('Card Inserted!',4,['grn'])
                }
            })
        }else {
            announcer.announce('Please search by name/set with 3+ characters',5,['rd'])
        }
    }
    id('exitcs').onclick = ()=> id('cardSearch').remove()
}

let kd = {}
document.onkeydown = (event)=>{
    let key = event.key.toLocaleUpperCase()
    kd[key] = true;
    if (event.ctrlKey &&  kd['R'] && kd['E'] && kd['M']) {
        if (hoverCard < 0) return ;
        let card = cardsInGame[hoverCard]
    }
}
document.oncontextmenu = (e)=>{
    if (onNextInput){
        e.preventDefault()
        onNextInput = false;
                                document.querySelectorAll('.ourcard').forEach(card=>{
                                    card.style.pointerEvents = 'all'
                                })
        nextInputCount = 1
        rmeoveUverlay()
    }else {

    }
}

document.onkeyup = (event)=>{
    let key = event.key.toLocaleUpperCase()
    kd[key] = false
    console.log(document.activeElement.value )
    if (!event.shiftKey && (key == 'ENTER' || key == 'RETURN') ){
        (id('upNote') || id('send')).onclick()
    }else if ((key == 'N' || key=='W') && !document.activeElement.value){
        if (hoverCard >=0 && !expandedDeck && !document.querySelector('.overlay')){
            let card = cardsInGame[hoverCard] || {}
            document.body.insertAdjacentHTML('beforeend',`
            <div class="overlay" id='g_addNote'>
            <center> <h1 style='background-color:rgb(0,0,0,0.3) ; color:white'> Card Notes </h1> </center>
                <div class = "twc gbg" style='padding-left:0.5em;height: 70vh; background-color: rgb(234,234,234); border-radius:4vh;display:flex'>
                    <div class='card gbg' style="background-image: url('${card.image}')">
                    </div>
                    <div style='position:relative;top:0px'>
                        <br>
                        <center> 
                            <textarea style='width:85%; height:65%;font-size:1.2em;padding:4px' id='g_noteIn'>${card.notes[0] || ''}</textarea>
                            <button id='g_upNote'>Update Note</button> <br>
                            <button id='g_remNote' style='background-color:red'; >Remove Note</button>
                            <button style='background-color:orange; position:absolute; bottom:0px;transform:translate(-50%,-50%); left:50%' id='g_exitnt' class='exit'>EXIT</button
                        </center>
                    </div>
                </div>

            </div>`
            )
        
            id('noteIn').focus()
            id('upNote').onclick = ()=>{
                let v = id('noteIn').value + ''
                if (v.length)connection.request("noteCard",{
                    from: userId,
                    note: v,
                    uid: hoverCard
                })
                setTimeout(()=>id('addNote').remove(),1)                
            }
            id ('remNote').onclick = ()=>{
                connection.request("noteCard",{
                    from: userId,
                    note: '',
                    uid: hoverCard
                })
                setTimeout(()=>id('addNote').remove(),1)                       
            }
            if (!id(`c_${hoverCard}`).className.includes('ourcard')) (id('upNote').remove() + id('remNote').remove() + (id('noteIn').readOnly =true));
            id('exitnt').onclick = ()=> id('addNote').remove()
        }
    }else if (key == 'S' && !document.activeElement.value){
        if (hoverCard >=0){
            busy = true
            connection.request('shakeCard',hoverCard)
            sleep(300).then(()=>busy=false)
        }
    }else if (key=='M' && !document.activeElement.value){
        if (event.altKey && !onNextInput && hoverCard >=0){
            console.log('hi')
            busy = true
            connection.request('topCardAttachedTo',{uid:hoverCard}, async function (data) {
                busy = false
                if (!data.name) return announcer.announce('Card has no attached cards',4,['rd'])
                let {name, uid} = data 
                await sleep(1);
                document.querySelectorAll('.ourcard').forEach(card=>{
                    card.style.pointerEvents = 'none'
                })
                nextInputCount = 1
                addUverlay(`Moving ${name} (currently attached)`, "Click the area you wish to move it to or right click to cancel" ,116,4,220)
                onNextInput = async (data={})=>{
                    console.log(data)
                    if (data.is != 'Zone') return false;
                    onNextInput = false
                    document.querySelectorAll('.ourcard').forEach(card=>{
                        card.style.pointerEvents = 'all'
                    })
                    ;
                    let res =  await connection.promise('moveCard',{uid,name:data.name,spot:data.spot})
                }               
            })
        }
    }else if (key.charCodeAt(0) > '0'.charCodeAt(0) && key.charCodeAt(0) <= '9'.charCodeAt(0) && !document.activeElement.value) {
        nextInputCount = key.charCodeAt(0) - '0'.charCodeAt(0);
        (id('r2num') || {}).innerHTML = key;
        console.log(nextInputCount)
    }else if (key=='ESC' || key == 'ESCAPE' || key == 'BACKSPACE' && !document.activeElement.value){
        document.querySelectorAll('.exit').forEach(bu=>{
            bu.onclick()
        }) 
    }
}
function extractTags(str) {
  const tagUSR = [];
  const tagCARD = [];

  const regex = /\$\[@(\d+)\]|\$\[#(\d+)\]/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (match[1] !== undefined) {
      tagUSR.push(Number(match[1]));
    }
    if (match[2] !== undefined) {
      tagCARD.push(Number(match[2]));
    }
  }

  return { tagUSR, tagCARD};
}
function format(str=''){
    let {tagUSR,tagCARD} = extractTags(str)
    tagUSR.forEach(uid=>{
       if (uid == Number(userId)) str = str.replace(`$[@${uid}]`,`<span class='ref u-${uid}'>you</span>`)   
       else str = str.replace(`$[@${uid}]`,`<span class='ref u-${uid}'>an opponent</span>`) 
    }) 
    tagCARD.forEach(uid=>{
        let c = cardsInGame[uid];
        if (c) str = str.replace(`$[#${uid}]`,`<span class='ref c-${uid}'>${cardsInGame[uid].name}</span>`)   
    })
return str
}
function reformat(){
    document.querySelectorAll('.ref').forEach(div=>{
        let uid = div.classList.toString().split('-')[1].split(' ')[0]
        let type = div.classList.toString().split('-')[0].split(' ')[1]
        //console.log(uid,type)
        if (type == 'c' && cardsInGame[uid]) div.innerHTML = cardsInGame[uid].name
    })
}
connection.setResponder("chat",(data)=>{
    console.log(data)
    if (data.updateState) {
        setupBoard(data.updateState,data.players,data.updateplayers)
         reformat();
    }
    let c = data.from == -1 ? 'Server' : (data.from == userId ? 'You' : 'Opponent')
    id('msgs').insertAdjacentHTML('afterbegin',`
        <div class="msg ${c}">
            <h4>${c}</h4>
            <p>${format(data.body)}</p>
        </div>
    `)
    return true;
})
connection.setResponder("shake", (data)=>{
    let carddiv = id(`c_${data}`)
    if (!carddiv) id('msgs').insertAdjacentHTML('afterbegin',`
        <div class="msg" style = 'background-color:rgb(255,95,95)'>
            <p>note: shook card that's offscreen.</p>
        </div>
    `) ; 
    else {
        carddiv.style.transform = 'scale(1.2) ' + carddiv.style.transform
        let i = 0
        let x = setInterval(()=>{
            let c = Math.sin(i)
            carddiv.style.left = 50*c 
            i+=1.1
        },30)
        setTimeout(()=>clearInterval(x) + (carddiv.style.transform=carddiv.style.transform.substring(11)) + (carddiv.style.left=0) ,450)
    }
})


setInterval(()=>{
    if (hoverCard >=0) {
        id('bigAhhCard').style.backgroundImage = `url('${cardsInGame[hoverCard].image}')`
        //id('bigAhhCard').innerHTML = `${cardsInGame[hoverCard].name} (cost: ${cardsInGame[hoverCard].cost})`
    }else{
        id('bigAhhCard').style.backgroundImage = ''
        //id('bigAhhCard').innerHTML = ''        
    }
},50)


import {fetchActiveUser} from '../fau.js'
async function main(){



    user = await fetchActiveUser()
    while (!connection.open) await sleep(10);
    let res = await connection.promise('catchup');
        console.log(res)
    if (res.good){
        setupBoard(res.game,res.players,[1,1])
        let [u,o] = res.pinfo
        if (res.players[0] != user.id)   [o,u] = res.pinfo;
        id('yourpfp').style.backgroundImage = `url("${u.pfp}")`      
        id('yourname').innerHTML = u.name
        id('yourid').innerHTML = 'id: ' + user.id

        id('opppfp').style.backgroundImage = `url("${o.pfp}")`      
        id('oppname').innerHTML = o.name
        id('oppid').innerHTML = 'id: ' + res.players.find(id=>id != user.id)
    }
}

main()