const ERRORCODES = {
    internal:   1011,
    badReq:     1003,
    authFail:   1008,  
    timeOut:    1001,  
    noError:    1000 
}
class Connection {
    constructor(serverURL,clientID, qParams = {}){
        let params = new URLSearchParams();
        params.append('clientID', clientID);
        
        for (const [key, value] of Object.entries(qParams)) {
            if (value != undefined) {
                params.append(key, typeof value == 'object' ? JSON.stringify(value) : value);
            }
        }
        this.ws =  new WebSocket('ws://' + serverURL + '?'+ params.toString());
        this.handlers = {};
        this.Responders = {};
        this.activeRequests = 0;
        this.open = false
        this.onStart = ()=>{}
        this.ws.onmessage =  (event)=>{
            let msg = event.data;
            let dta = JSON.parse(msg);
            if (dta.event == "Websocket_READY") {
                if (this.ws.OPEN && !this.open){
                    this.open = true;
                    this.onStart();
                }
            }else if (this.Responders[dta.event] && dta.returnPoint) this.Responders[dta.event](dta.data,dta.returnPoint);
            else if (this.handlers[dta.event]) this.handlers[dta.event](dta.data);
            else console.warn("Invalid event called: ", dta.event);
        }
        this.onInternalError = () => console.log('Internal error - connection closed');
        this.onBadReqError = () => console.log('Bad Request- Connection closed')
        this.onAuthFailError = () => console.log('Auth Failure- Connection closed')
        this.onExitSuccess = () => console.log('Successful exit - Connection closed')

        this.ws.onclose = (event)=>{
            switch (event.code) {
                case ERRORCODES.internal:
                    this.onInternalError();
                    break;
                case ERRORCODES.badReq:
                    this.onBadReqError();
                    break;
                case ERRORCODES.authFail:
                    this.onAuthFailError();
                    break;
                case ERRORCODES.noError:
                    this.onExitSuccess();
                    break;
            }
        }
    }
    send(eventType,eventData){
        this.ws.send(JSON.stringify({event:eventType,data:eventData})); 
    }

    request(requestType,requestData, whenFinished = ()=>{}, timeout = 10000){
        this.activeRequests++;
        let hname = "tm" + Date.now() +  "___REQUESTS___" + this.activeRequests;
        this.ws.send(JSON.stringify({event:requestType,data:requestData, returnPoint: hname}))
        let tm_err = setTimeout(()=>{
            if (this.handlers[hname]){
                this.activeRequests--;
                this.handlers[hname] = null;
                return whenFinished({}, ERRORCODES.timeOut);
            }
        },timeout)
        this.handlers[hname] = (data)=>{
            clearTimeout(tm_err);
            console.log("HERE")
            this.activeRequests--;
            this.handlers[hname] = null;
            return whenFinished(data);
        }
    }

    promise(eventType, reqData, timeOut = 10000) {
        let eta = this
        return new Promise((resolve, _) => {
            eta.request(eventType, reqData, (response) => resolve(response), timeOut);
        });
    }

    setHandler(eventType,processer) {
        this.handlers[eventType] = (data) => processer(data);
    }
    setResponder(requestType,processer) {
        this.handlers[requestType] = (data,returnPoint) => {
            this.send(returnPoint, processer(data));
        }
    }
}

async function sleep(ms) {
    return await new Promise(x=>setTimeout(x,ms));
} 

export {sleep,ERRORCODES,Connection};