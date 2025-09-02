let colors = [
    '150,0,0',
    '200,190,0',
    '0,150,0',
    '0,0,150',
    '120,0,120',
    '50,50,50',
]
let colnames = ["Red","Yellow","Green","Blue","Purple","Black"]
document.querySelectorAll('.colorselect').forEach(cw =>{
    let s = ''
    for (let i = 0; i < 6; i++) s +=` <div class="cs_row" style="background-color:rgb(${colors[i]})" id='${cw.id}_auto${i}'> </div>`
    
    cw.innerHTML = s;
    cw.ON = [1,1,1,1,1,1]
    for (let i = 0; i < 6; i++) document.getElementById(`${cw.id}_auto${i}`).onclick = ()=>{
        cw.ON[i] = !cw.ON[i]
        if (cw.ON[i]) document.getElementById(`${cw.id}_auto${i}`).style.backgroundColor = `rgba(${colors[i]})`
        else  document.getElementById(`${cw.id}_auto${i}`).style.backgroundColor = `rgba(${colors[i]},0.25)`
        if (cw.onChange) cw.onChange(colors[i]);
    }
    for (let i = 0; i < 6; i++) document.getElementById(`${cw.id}_auto${i}`).oncontextmenu = (e)=>{
        e.preventDefault()
        let newOn = [0,0,0,0,0,0]
        newOn[i] = 1;
        cw.SETTO(newOn)
        for (let e = 0; e <6; e++) if (cw.onChange) cw.onChange(colors[e]);

    }
    cw.SETTO = (newOn) => {
        cw.ON = newOn
        for (let i = 0; i < 6; i ++)         
            if (cw.ON[i]) document.getElementById(`${cw.id}_auto${i}`).style.backgroundColor = `rgba(${colors[i]})`
            else  document.getElementById(`${cw.id}_auto${i}`).style.backgroundColor = `rgba(${colors[i]},0.25)`
    }
})
