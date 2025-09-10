
let fs = require('fs');
let cardbase = JSON.parse(fs.readFileSync('./cardbase.json').toString())
function capFirstLetter(s=''){
    if (!s.length) return '';
    return s[0].toLocaleUpperCase() + s.substring(1).toLocaleLowerCase()
}
async function main(){
    for (let i = 1; i <= 32; i++){
        let res = await fetch(`https://apitcg.com/api/one-piece/cards?page=${i}&limit=100`, {
            headers: {
    'x-api-key': '4f0befeba459a316f9f841eca1255fd1211e0ddc12340fdbb04d48eafa7a8369'
  }
        })
        let resj = await res.json()
        resj.data.forEach(c=>{
            let [set,iid] = c.code.split('-')

            let card = {
                name: c.name,
                cowpow: Number(c.counter) || 0,
                set, iid,
                uid: cardbase.length,
                color: c.color,
                power: c.power,
                cost: c.cost,
                type: capFirstLetter(c.type),
                class: c.family,
                text: c.ability + c.trigger ,
                imgs: [c.images.large]
            }
            let oc = cardbase.find(c=> c.set == card.set && c.iid == card.iid)
            if (oc) {
                oc.imgs.push(card.imgs[0])
                card.imgs = oc.imgs;
                Object.keys(oc).forEach(key=> oc[key] = card)
            }
            else cardbase.push(card)
        })
    }    
    fs.writeFileSync('./cardbase.json',JSON.stringify(cardbase,null,2))
} 

let x = {
    "name":"Franky",
    "cowpow":1000,     
    "set":"ST01",
    "iid":10,
    "uid":23,
    "color":"Red",
    "power":6000,
    "cost":4,
    "type":"Character",
    "class":"Straw Hat Crew",
    "text":" ",
    "imgs":["https://onepiece-cardgame.dev/images/cards/ST01-010_8266c1_jp.jpg","https://onepiece-cardgame.dev/images/cards/ST01-010_c7e0bb_jp.jpg"]}
main()



/*
{
        "id": "ST14-001",
        "code": "ST14-001",
        "rarity": "L",
        "type": "LEADER",
        "name": "Monkey.D.Luffy",
        "images": {
            "small": "https://en.onepiece-cardgame.com/images/cardlist/card/ST14-001.png?241220",
            "large": "https://en.onepiece-cardgame.com/images/cardlist/card/ST14-001.png?241220"
        },
        "cost": 5,
        "attribute": {
            "name": "Strike",
            "image": "https://en.onepiece-cardgame.com/images/cardlist/attribute/ico_type01.png"
        },
        "power": 5000,
        "counter": "-",
        "color": "Black",
        "family": "Straw Hat Crew",
        "ability": "[DON!! x1] All of your Characters gain +1 cost. If you have a Character with a cost of 8 or more, this Leader gains +1000 power.",
        "trigger": "",
        "set": {
            "name": "-3D2Y- [ST-14]"
        },
        "notes": []
    }
*/