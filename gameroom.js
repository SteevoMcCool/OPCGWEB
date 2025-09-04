const fs = require('fs');
const backImage = 'https://cf.geekdo-images.com/cpyej29PfijgBDtiOuSFsQ__opengraph/img/MLqCKq9sxmXsWkf36oUxy93Nzjc=/fit-in/1200x630/filters:strip_icc()/pic6974116.jpg'
const backDonImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3c-CFhzvnOVFrYuJsODgpIKoH2-_clWyh0Q&s'
const frrontDonImage =  'https://tcgplayer-cdn.tcgplayer.com/product/549342_in_1000x1000.jpg'
class CARD {
    constructor(uid,frontImage, backImage,name,cost,where){
        this.frontImage = frontImage
        this.uid = uid
        this.backImage = backImage
        this.name = name
        this.cost = cost
        this.revealed = [0,0]
        this.attached = []
        this.active = true;
        this.notes = []
        this.attached.where = where
    }
    get where(){
        return this.attached.where
    }
    set where(v){
        this.attached.where = v
    }
    tap(){
        this.active = !this.active
    }
    addNote(note){
        this.notes.push(note)
    }
    editNote(spot,note){
        this.notes.splice(spot,1,note)
    }
    remNote(spot){
        this.notes.splice(spot,1)
    }
    reveal(){
        this.revealed = [1,1]
    }
    hide(){
        this.revealed = [0,0]
    }
    showOnlyTo(pid){
        this.revealed = pid ? [0,1] : [1,0]
    }
    toJSON(){
        return {
            frontImage: this.frontImage,
            uid: this.uid,
            backImage: this.backImage,
            name: this.name,
            cost: this.cost,
            revealed: this.revealed,
            attached: this.attached,
            active: this.active,
            notes: this.notes
        }
    }
}
class GAME {
    constructor(){
        this.lcuid = 0
        this.player1= {
            characterZone:[],
            mainDeck:[],
            donDeck:[],
            trash:[],
            lifeDeck:[],
            donArea:[],
            leadZone:[],
            stageZone:[],
            hand:[]
         }
        this.player2 = {
            characterZone:[],
            mainDeck:[],
            donDeck:[],
            trash:[],
            lifeDeck:[],
            donArea:[],
            leadZone:[],
            stageZone:[],
            hand:[]

        }
    }
    toJSON(){
        return {player1:this.player1,player2:this.player2}    
    }
    addZone(player,zoneName){
        if (player[`ez_${zoneName}`] == undefined) player[`ez_${zoneName}`] = []
    }
    addDonCard(zone,frontImage=frrontDonImage){
        zone.push(new CARD(this.lcuid++,frontImage,backDonImage,'DON!!',0,zone))
    }
    addCard(zone,meta_uid,custom=0){
        let arr = custom ? JSON.parse(fs.readFileSync("./Data/ccbase.json").toString()) : JSON.parse(fs.readFileSync("./Data/cardbase.json").toString()) 
        let basecard = arr[meta_uid]
        zone.push(new CARD(this.lcuid++,basecard.imgs[0],backImage,basecard.name,basecard.cost,zone))
    }
    attach(card1,card2){
        if (card1 == card2) return 'false card1 == card2'
        let x = card1.where.indexOf(card1);
        if (x>=0) card1.where.splice(x,1);
        if (this.nameOf(card2.where) == 'NULLZONE') return 'false card2 is already attached'
        card1.where = card2.attached
        card2.attached.push(card1)
    }
    move(card,zone,spot,revealed){
        let x = card.where.indexOf(card);
        if (x>=0) card.where.splice(x,1);
        zone.splice(spot,0,card)
        card.where = zone
        card.active = true
        console.log(this.ownerOf(zone))
        let DA = this[`player${this.ownerOf(zone)}`].donArea
        for (let i = card.attached.length - 1; i >= 0; i--) {
            const c = card.attached[i];
            this.move(c, DA, DA.length, [1,1]);
            console.log("Moved ", DA.length);
            c.active = false;
        }
        card.notes = []
        if (revealed) card.revealed = revealed
    }
    
    ownerOf(zoneOrCard){
        if (zoneOrCard.where) return this.ownerOf(zoneOrCard.where)
        for (let [k,v] of Object.entries(this.player1)) {
            if (v==zoneOrCard) return 1;
        }
        for (let [k,v] of Object.entries(this.player2)) {
            if (v==zoneOrCard) return 2;
        }
        return 0
    }
    reset(pnum){
        this[`player${pnum}`] = {
            characterZone:[],
            mainDeck:[],
            donDeck:[],
            trash:[],
            lifeDeck:[],
            donArea:[],
            leadZone:[],
            stageZone:[],
            hand:[]
           
        }
    }
    find(uid) {
        const searchZone = (zone) => {
            for (let c of zone) {
                if (c.uid === uid) return c;
                let found = searchZone(c.attached);
                if (found) return found;
            }
            return null;
        };

        for (let [, zone] of Object.entries(this.player1)) {
            let found = searchZone(zone);
            if (found) return found;
        }
        for (let [, zone] of Object.entries(this.player2)) {
            let found = searchZone(zone);
            if (found) return found;
        }
        return null;
    }
    nameOf(zone){
        for (let [k,v] of Object.entries(this.player1)) {
            if (v==zone) return `P1-${k}`;
        }
        for (let [k,v] of Object.entries(this.player2)) {
            if (v==zone) return `P2-${k}`;
        }
        return 'NULLZONE'
    }
    exportFor(playerNum){
        playerNum--; //shifts from 1-index to 0-index
        let json = JSON.parse(JSON.stringify(this.toJSON()))
        Object.values(json.player1).forEach(zone=>{
            zone.forEach(c=>{
                c.image = c.revealed[playerNum] ? c.frontImage : c.backImage;
                c.name =  c.revealed[playerNum] ? c.name : 'a card';
                c.cost = c.revealed[playerNum] ? c.cost : '??';
                c.frontImage = (c.backImage = undefined);
                c.attached.forEach(c=>{
                    c.image = c.revealed[playerNum] ? c.frontImage : c.backImage;
                    c.name =  c.revealed[playerNum] ? c.name : 'a card';
                    c.cost = c.revealed[playerNum] ? c.cost : '??';   
                    c.frontImage = (c.backImage = undefined);
                })
            })
        })
        Object.values(json.player2).forEach(zone=>{
            zone.forEach(c=>{
                c.image = c.revealed[playerNum] ? c.frontImage : c.backImage;
                c.name =  c.revealed[playerNum] ? c.name : 'a card';
                c.cost = c.revealed[playerNum] ? c.cost : '??';
                c.frontImage = (c.backImage = undefined);
                c.attached.forEach(c=>{
                    c.image = c.revealed[playerNum] ? c.frontImage : c.backImage;
                    c.name =  c.revealed[playerNum] ? c.name : 'a card';
                    c.cost = c.revealed[playerNum] ? c.cost : '??';   
                    c.frontImage = (c.backImage = undefined);
                })
            })
        })
        return json;
    }
}


module.exports = {CARD,GAME}
