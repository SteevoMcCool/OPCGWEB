class Announcer {
    constructor(uid){
        this.mid = 0;
        document.body.insertAdjacentHTML("beforeend", `
            <div class="Announcer" id ="X${uid}">
            </div> 
        `)
        this.uid = uid;
        this.html = document.getElementById("X"+uid);
    }
    
    announce(msg,time,styling){
        this.html.insertAdjacentHTML("beforeEnd",  `
            <div class="Message ${styling.join(" ")}" id = "X${this.uid}__${this.mid}">
                ${msg}
            </div>
            `)
        let a = this.mid
        setTimeout(()=> document.getElementById(`X${this.uid}__${a}`).remove() , time*1000)
        this.mid++;
    }
}

export {Announcer}