const fs = require('fs');
let data = JSON.parse(fs.readFileSync('badlist.json','utf-8'))

/*
1 - RED
4 - PURPLEs
6 - BLUE
7 - GREEN
12- BLACK
16 - YELLOW
*/           
let cols = ['',
            'Red',              '',             '',             'Purple',           '',
            'Blue',             'Green',        'Blue/Green',   'Red/Blue',       'Red/Green', 
            'Blue/Purple',      'Black',        'Purple/Black', 'Red/Black',      'Blue/Green',
            'Yellow',           'Yellow/Green', 'Yellow/Black', 'Blue/Black',     'Green/Black',
            'Yellow/Purple',    'Red/Yellow',   'Yellow/Blue',  'Red/Purple',     'Green/Purple'

]
let types = ['','Leader','Character','Event','Stage']
let cards = {};
let x = 0;
data.forEach(card => {
    if (card.cid.split('-')[0] == "DON") ;
    else if (cards[card.cid]) cards[card.cid].imgs.push(card.iu)
    else cards[card.cid] = {
        name: card.n,
        cowpow: Number(card.cp) || 0,
        set: card.cid.split('-')[0],
        iid: Number(card.cid.split('-')[1]),
        uid: x++,
        color: cols[Number(card.col)],
        power: Number(card.p),
        cost: Number(card.cs),
        type: types[Number(card.t)],
        class: card.tr,
        text: card.e || " ",
        imgs: [card.iu]
    }
});
let i = 0;
fs.writeFileSync("cardbase.json", JSON.stringify(Object.values(cards).map(c=>(c.uid = i++, c) )))