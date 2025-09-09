let params =  new URLSearchParams(window.location.search)
let host = window.location.protocol + "//" + window.location.host
let prefix = "p_";
let id = s => document.getElementById(prefix + s)
/////////////////////////////////////////////////////////
import { fetchActiveUser } from '../fau.js';
import {Announcer} from './announcer.js'
let announcer = new Announcer("rhrheje");
import { genFire } from '../campfire.js';
let user;
async function main() {
    user = await fetchActiveUser()
    console.log(user)
    if (!user) window.location.replace('/login')
    id('username').innerHTML = user.name 
    id('userId').innerHTML = `id: ${user.id}` 
    id('email').innerHTML = user.email 
    id('pfp').style.backgroundImage = `url("${user.profileImage}")`
}

let deb = false
id('logout').onclick = async function(){
    window.localStorage.clear()
   window.location.replace("/login")
}

id('editUsername').onclick = async function() {
    document.body.insertAdjacentHTML('beforebegin',`
        <div class='overlay'>
        <div class='twc' style='width:40vw;height:30vh; background-color:beige;border-radius:30px'>
            <center>
            <h2>Editing Username</h2>
            <input id='p_newName'> <br>
            <button id='p_editName' class='grbu'>Confirm Edit</button><br><br>
            <button id='p_cancel'>Cancel</button>
            </center>
        </div>
  
        </div>
    `)
    id('newName').value = user.name
    id('cancel').onclick = ()=> document.querySelector('.overlay').remove()
    id('editName').onclick = async ()=>{
        if (deb) return true;
        deb = true;
        let res = await fetch('/editUname',{
            method:'post',
            body: JSON.stringify({id:user.id, session:user.session, name:id('newName').value})
        })
        let resj = await res.json();
        console.log(resj)
        announcer.announce(resj.details, 4.5, [resj.good ?'grn':'rd'])
        if (resj.good){
            id('username').innerHTML = (user.name = id('newName').value);
            document.querySelector('.overlay').remove()

        }
        deb = false
    }

}


let pfpOptions = [
    'https://i.pinimg.com/736x/1a/e3/8b/1ae38b5d8d53173046e9107f6ad4a329.jpg', //luffy
    'https://seakoff.com/cdn/shop/articles/exploring-zoro-from-one-piece-the-legendary-swordsman-and-his-epic-battles-299359.jpg?v=1718531298', //zoro
    'https://us.oricon-group.com/upimg/detail/5000/5194/img660/onepiece-nami-birthday-2025-01.jpg', //nami
    'https://i.pinimg.com/736x/5c/38/fc/5c38fcfe181a1da8b511775e30042b33.jpg', //shanks
    'https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/09/crocodile.jpg', //crocodile
    'https://static.beebom.com/wp-content/uploads/2024/05/Dr.-Vegapunk.jpg', //vegapunk
    'https://static0.cbrimages.com/wordpress/wp-content/uploads/2019/11/Featured-Things-About-Eustass-Kid.jpg', //kidd
    'https://static0.srcdn.com/wordpress/wp-content/uploads/2024/03/kaido-hybrid-form.jpg' // kaido
]
id('editpfp').onclick = async function() {
  document.body.insertAdjacentHTML('beforebegin',`
        <div class='overlay'>
            <div class='twc' style='width:70vw;height:84vh; background-color:beige;border-radius:30px'>
            <div id='p_pfpOpts'> </div>
            <center>
                <br>
                <button id='p_changepfp' class='grbu'>Confirm Change</button>
                <br><br>
                <button id='p_cancel'>Cancel</button>
            </center
        </div>
    `)  
    id('cancel').onclick = ()=> document.querySelector('.overlay').remove()
    pfpOptions.forEach((img,i)=>{
        id('pfpOpts').insertAdjacentHTML('beforeend',`
            <div id='p_img${i}' class='gbg ${img==user.profileImage ? 'selected': ''}' style='background-image: url("${img}")'>
            </div>    
        `)
        let z = i
        id(`img${z}`).onclick = ()=>{
            document.querySelectorAll('.gbg').forEach(div => div.classList.remove('selected'))
            id(`img${z}`).classList.add('selected')
        }
    })
    id('changepfp').onclick = async ()=>{
        if (deb) return true;
        deb = true;
        let img = pfpOptions[Number(document.querySelector('.selected').id.split('g')[1])]
        let res = await fetch('/editPfp',{
            method:'post',
            body: JSON.stringify({id:user.id, session:user.session, profileImage:img})
        })
        let resj = await res.json();
        console.log(resj)
        announcer.announce(resj.details, 4.5, [resj.good ?'grn':'rd'])
        if (resj.good){
            user.profileImage = img;
            id('pfp').style.backgroundImage = document.querySelector('.selected').style.backgroundImage;
            document.querySelector('.overlay').remove()
        }
        deb = false
    }
}
main()

genFire(id('fdiv'),0.25,8)