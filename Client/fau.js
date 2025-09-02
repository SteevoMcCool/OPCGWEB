let host = window.location.protocol + "//" + window.location.host

async function fetchActiveUser(){
    let id = window.localStorage.getItem("userId")
    let sesh = window.localStorage.getItem("session")
    //console.log(id,sesh)
    let res =  await (await fetch(`${host}/persist`,{
        method:"post",
        body: JSON.stringify( {id,sesh} )
    })).json();
    //console.log(res)
    if (res.good) return res.details;
    return false;
}



export {fetchActiveUser};