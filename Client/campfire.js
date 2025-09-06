let img = 'https://i.pinimg.com/originals/b9/67/d1/b967d1e281bd0aaca615e889386b0496.gif';
let smokeimg = 'https://i.ibb.co/FkCKSr2Z/smokecloud.png'
let fnum = 0;
function nummfromStr(str){
    let matches = str.match(/(\d+)/);
    if (matches) return Number(matches[0]);
    return ''
}
function genFire(div=document.createElement('div'),spawnspeed=2.05,speed=12){
    div.style.display = 'flex'
    div.style.flexDirection = 'column-reverse'
    div.innerHTML = `
        <div id='fire${fnum}' style='background-image:url("${img}"); width:100%; aspect-ratio:1;z-index:4;' class='gbg'>
        </div>
    `
    let tid = fnum;
    let fire = document.getElementById(`fire${fnum}`)
    let i = 0;
    setInterval(()=>{
        div.insertAdjacentHTML('beforeend',`
            <div id='smoke${i}_${tid}' style='width:35%;height:35%;background-image:url("${smokeimg}"); transition: all 0.3s' class='gb2'>

            </div>
        `)
        let smoke = document.getElementById(`smoke${i}_${tid}`)
        smoke.style.position = 'absolute';
        let height = fire.getBoundingClientRect().top- div.getBoundingClientRect().top  + fire.getBoundingClientRect().height/10
        smoke.style.top = `${height}px` 
        smoke.style.left = `${(Math.random()/2  + 0.05) * fire.getBoundingClientRect().width}px`
        smoke.style.scale = 1;
        let offset = Math.random()/8 - 1/16
        let opacity = 0.8
        let spd = 1
    ////////////
smoke.style.top = `${nummfromStr(smoke.style.top) -  height*speed/144 * Math.cos(offset)*spd}px` 
            smoke.style.left = `${nummfromStr(smoke.style.left) + height*speed/144 * Math.sin(offset)*spd }px` 
            console.log(nummfromStr(smoke.style.left) )
            smoke.style.scale =  Number(smoke.style.scale) +0.09
            opacity = opacity > 0.5 ? opacity - 0.05 : opacity * (speed-2)/(speed-1)
            spd = (spd - 0.3)*0.2 + 0.3;
            smoke.style.filter = `opacity(${opacity})`
            if (nummfromStr(smoke.style.top) <= 20) {
                spd = 0;
                setTimeout(()=>{
                                    smoke.remove()+ clearInterval(this)
                },500)
            }

    //////////
        setInterval(()=>{
            smoke.style.top = `${nummfromStr(smoke.style.top) -  height*speed/144 * Math.cos(offset)*spd}px` 
            smoke.style.left = `${nummfromStr(smoke.style.left) + height*speed/144 * Math.sin(offset)*spd }px` 
            smoke.style.scale =  Number(smoke.style.scale) +0.1
            opacity *= (speed-2)/(speed-1)
            spd = (spd - 0.5)*0.2 + 0.5;
            smoke.style.filter = `opacity(${opacity})`
            if (nummfromStr(smoke.style.top) <= 20) {
                spd = 0;
                setTimeout(()=>{
                                    smoke.remove()+ clearInterval(this)
                },1500)
            }
        },100)
        i++;
    }, 1000/spawnspeed)
    fnum++;
}

export {genFire}