
const tabs = {
    getAccess: `
        <h1>Access to the API</h1>
        <p>To gain access to the api, pay the $2 fee on the <a href="https://www.patreon.com/14806409/join">Patreon</a></p>
        <p>We will then send you access to your API keys via your Patreon email.</p>
        <i>This may take several minutes. If you do not recieve a code in 15 minutes, email <a>steveisrad.net@gmail.com</a> using your Patreon email.</i>

        <p>WARNING- Full support for this system is still in development</p>
        <p>Most code examples only show JS and Python, but all programming languages can be used. </p>
        `,
    auth: `
        <h1>Authorization</h1>
        <p>For all requests, you must include one of your tokens in the request header as shown.</p>
        <div class="codeBlock" id='cb_auth'>
        </div>

        Success Result:
        <div class="codeblock res">
            {good: true, details: {message:"OPCG says pong!"}}
        </div>
        <br>
         All responses are a JSON object with 2 properties:
         <table>
            <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
            <tbody><td>good</td><td>bool</td><td>set to 'true' only when the request is successful</td></tbody>
            <tbody><td>details</td><td>json</td><td>contains key/value pairs with the result of the request. Upon error, contains a 'code' (number) and 'message'(string)</td></tbody>
         </table>
    `,
    getCardData:  `
        <h1>Getting Card Data</h1>
        <p>Use the <span class="codeinline">/cards</span> POST method to gain access to the card database. Example below.</p><br>
                <div class="codeBlock" id='cb_cardData'>

        <pre></pre>  

        </div>
        <p style="margin-top: 0.2em; margin-bottom: 0.2em;">As seen above, you provide a named list of filters you wish to be ran.</p>
            <ul style="margin-top: 0.2em;">
            <li>For numerical filters, like 'cost' and 'power', we provide <span class="codeinline">min</span> and <span class="codeinline">max</span> options.
            </li><li>For string filters, like 'name','color' and 'text', we provide <span class="codeinline">includes</span>, <span class="codeinline">startsWith</span>, and <span class="codeinline">caseSensitive</span>
            </li><li> You can 'INVERT' any filter by setting <span class="codeinline">inverted</span> to <span class="codeinline">1</span>.
            </li></ul>
        <p>Note: <span class="codeinline">caseSensitive</span> is TRUE by default.You can add restrictions for ANY stat on the card.</p>
        <p>Upon success, this will return a list of card structs that passes all the provided filters. Example:</p>
        <div class="codeblock res">
            {good: true, details: [{name:'Monkey D. Luffy', ...}, {name:'Monkey D. Garp', ...}, ...]}
        </div>     
        <p>For more info on what data is contained with each card, see <span class="codeinline">card struct</span> section.</p>
    `,
    deckManager:`
        <h1>Add/Get/Set Decks</h1>
        <p>Unlike your user account, your api keys can be paired with up to 100,000 decks. View  <span class="codeinline">deck struct</span> section for information on
        how decks are stored.</p>
        <div style='display:flex;align-items:baseline;'> 
            <h2>Add Deck</h2> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;POST&nbsp;&nbsp;&nbsp;&nbsp;</p>    
            <span class='codeinline' style='height:min-content';>/addDeck</span>
        </div>

        <div style='display:flex'>
            <div>
                    Body Parameters: (inside the JSON)
                
                <table>
                    <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
                    <tbody><td>name</td><td>string</td><td>The name of the new deck you wish to create</td></tbody>
                </table>
            </div>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <div>
                Return Format:
                <table>
                    <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
                    <tbody><td>id</td><td>string</td><td>The id of the newly created deck</td></tbody>
                </table>
            </div>
        </div>





        <div style='display:flex;align-items:baseline;'> 
            <h2>Get Deck</h2> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;POST&nbsp;&nbsp;&nbsp;&nbsp;</p>    
            <span class='codeinline' style='height:min-content';>/getDeck</span>
        </div>

        <div style='display:flex'>
            <div>
                    Body Parameters: (inside the JSON)
                
                <table>
                    <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
                    <tbody><td>id</td><td>id</td><td>The id of the  deck you wish to retrieve</td></tbody>
                </table>
            </div>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <div>Return Format: <span class="codeinline">deck struct</span></div>
        </div>

        <div style='display:flex;align-items:baseline;'> 
            <h2>Set Deck</h2> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;POST&nbsp;&nbsp;&nbsp;&nbsp;</p>    
            <span class='codeinline' style='height:min-content';>/setDeck</span>
        </div>

        <div style='display:flex'>
            <div>
                    Body Parameters: Stringify a deck struct.
            </div>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <div>Return Format: <span class="codeinline">deck struct</span></div>
        </div>

    `,
    deckManager2:`
    <h1>Get All/Delete Decks + Examples</h1>
    <div style='display:flex;align-items:baseline;'> 
        <h2>Get All Decks</h2> 
        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;POST&nbsp;&nbsp;&nbsp;&nbsp;</p>    
        <span class='codeinline' style='height:min-content';>/getAllDecks</span>
    </div>

    <div style='display:flex'>
        <div>
                Body Parameters: none
        </div>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        <div>
            Return Format: LIST of these structures
            <table>
                <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
                <tbody><td>id</td><td>string</td><td>The id of each deck</td></tbody>
                <tbody><td>name</td><td>string</td><td>The name of each deck</td></tbody>

            </table>
        </div>
    </div>

    <div style='display:flex;align-items:baseline;'> 
            <h2>Get Deck</h2> 
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;POST&nbsp;&nbsp;&nbsp;&nbsp;</p>    
            <span class='codeinline' style='height:min-content';>/getDeck</span>
        </div>

        <div style='display:flex'>
            <div>
                    Body Parameters: (inside the JSON)
                
                <table>
                    <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
                    <tbody><td>id</td><td>id</td><td>The id of the  deck you wish to delete</td></tbody>
                </table>
            </div>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <div>Return Format: <span class="codeinline">deck struct</span> (of the deleted deck)</div>
        </div>
        <p>Example:</p>
            <div class='codeblock' style='height:15em;overflow-y:auto' id='cb_deck'></div>

`,
    cardStruct:`
        <h1>Card Data Structure</h1>

        <p>The Card Struct is a representation of a One Piece Trading Card</p>
        <p>Below is a list of the attributes of the struct</p>
         <table>
            <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
            <tbody><td>name</td><td>string</td><td>The name of the card</td></tbody>
            <tbody><td>set</td><td>string</td><td>The set that the card was released in</td></tbody>
            <tbody><td>iid</td><td>number</td><td>The card's id number in that set</td></tbody>
            <tbody><td>color</td><td>string</td><td>The card's color(s), seperated by slashes.</td></tbody>
            <tbody><td>class</td><td>string</td><td>Either 'Leader','Character','Event',or 'Stage'</td></tbody>
            <tbody><td>cost</td><td>number</td><td>The cost of the card. 0 for leaders.</td></tbody>
            <tbody><td>power</td><td>number</td><td>The power of the card. 0 for events/stage</td></tbody>
            <tbody><td>counterPower</td><td>number</td><td>The counter power of the card. 0 for non-characters</td></tbody>
            <tbody><td>text</td><td>string</td><td>The card text. Includes trigger.</td></tbody>
            <tbody><td>imgs</td><td>string[]</td><td>A list of all released arts. Not filterable using <span class='codeinline'>/cards</span>.</td></tbody>

            <tbody><td>uid</td><td>number</td><td>The card's unique id number in the database</td></tbody>
         </table>  `,
    deckStruct:`
        <h1>Deck Data Structure</h1>
        <p>Below is a list of the attributes of the struct</p>
        <table>
            <tbody><th>Name</th><th>Type</th><th>Descirption</th></tbody>
            <tbody><td>name</td><td>string</td><td>The name of the deck</td></tbody>
            <tbody><td>id</td><td>string</td><td>The id of the deck</td></tbody>
            <tbody><td>lead</td><td>[string,string]</td><td>the BANDAI identifier and chosen art (optional) of the leader</td></tbody>
            <tbody><td>cards</td><td>deckItem[]</td><td>The contents of the deck (see format below)</td></tbody>
         </table> 
        <h2>Deck-Item Data Structure</h2>
        <p>This is how items in your deck are represented. Note- THIS IS DIFFERENT THAN 'CARD'</p>
        It is an unnamed list of 3 items
        <ul>
            <li>The count of that card in the deck (number)</li>
            <li> The BANDAI identifier of that card (string)</li>
            <li> (Optional) Preferred art for that card (string)</li>
        </ul>
        An example would be <span class='codeinline'>[3, 'OP02-049','https://en.onepiece-cardgame.com/images/cardlist/card/OP02-049.png']</span>
        which indicates there is 3x Empiro Ivankov (OP02-049) with that art in the deck.
    `
}



const codeBlocks = {
    auth: {
        WebJS:`let res = await fetch('167.88.39.205:8000/ping',{
    headers: {
        "x-api-key": YOURAPIKEY,
    }
})`,
       Python:`
res = requests.get("http://167.88.39.205:8000/ping", 
    headers={
        "x-api-key": YOURAPIKEY
    }
)`
    },
    cardData:{
        WebJS:`let res = await fetch("http://167.88.39.205:8000/cards",{
    method:'POST',
    headers:{
        "x-api-key": YOURAPIKEY,
    },
    body: JSON.stringify{
        cost: {min:3,max:7},
        power: {max:7000},
        text: {includes:'Blocker',caseSensitive:0,inverted:1},
        name: {startsWith:'Monkey D. Garp'}
        ...
    }
})`,
       Python:`
response = requests.post("http://167.88.39.205:8000/cards",
    headers={
        "x-api-key": "YOURAPIKEY"
    },
    data=json.dumps({
        "cost": {"min": 3, "max": 7},
        "power": {"max": 7000},
        "text": {"includes": "Blocker", "caseSensitive": 0, "inverted": 1},
        "name": {"startsWith": "Monkey D. Garp"}
        ... 
    })
)
    `       
    },
    deck:{
        WebJS:`let res = await fetch("http://167.88.39.205:8000/addDeck",{
    method:'POST',
    headers:{"x-api-key": YOURAPIKEY},
    body: JSON.stringify({name:'Deck Name'})
}
let {good,details} = await res.json();
if (!good) process.exit(details.code)--...ERROR HANDLING...; 
let deck = {
    name: 'Deck Name',
    id: details.id,
    leader: ['OPO1-002','https://en.onepiece-cardgame.com/images/cardlist/card/OP01-002_p1.png'],
    cards: [
        [4,'OP01-005','https://en.onepiece-cardgame.com/images/cardlist/card/OP01-005.png'], //4x OP01-005 with link to the chosen art
        [2,'OP05-025'], //2x OP05-025. No provided art means we will use the first art in our database
        //continue putting cards here
    ]
}
let res = await fetch("http://167.88.39.205:8000/setDeck",{
    method:'POST',
    headers:{"x-api-key": YOURAPIKEY},
    body: JSON.stringify(deck)
}

`,  Python:`res = requests.post(
    "http://167.88.39.205:8000/addDeck",
    headers={"x-api-key": YOURAPIKEY},
    json={"name": "Deck Name"}
)

data = res.json()
good, details = data.get("good"), data.get("details")

if not good:
    # ...ERROR HANDLING...
    exit()

deck = {
    "name": "Deck Name",
    "id": details["id"],
    "leader": ["OPO1-002", "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-002_p1.png"],
    "cards": [
        [4, "OP01-005", "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-005.png"],  # 4x OP01-005 with link to the chosen art
        [2, "OP05-025"],  # 2x OP05-025. No provided art means we will use the first art in our database
        # continue putting cards here
    ]
}

res = requests.post(
    "http://167.88.39.205:8000/setDeck",
    headers={"x-api-key": YOURAPIKEY},
    json=deck
)`
    }
}

let mode = 'WebJS'
document.querySelector('.leftNav').querySelectorAll('button').forEach(button=>{
    button.onclick = ()=>{
        document.querySelectorAll('.selected').forEach(sel=>sel.classList.remove('selected'))
        button.classList.add('selected')
        document.querySelector('.beigebody').innerHTML = tabs[button.id]
        Object.keys(codeBlocks).forEach(bname=>{
            let html = document.getElementById(`cb_${bname}`)
            let block = codeBlocks[bname]
            console.log(html)
            if (!html) return;
            html.innerHTML =`
                <div class='cb_top'>
                </div>
                <pre>${block[mode]}</pre>
            
            `
            Object.keys(block).forEach(lang=>{
                html.querySelector('.cb_top').insertAdjacentHTML('beforeend',`<button class='${mode==lang?"selected":''}'>${lang}</button>`)
            })
            html.querySelector('.cb_top').querySelectorAll('button').forEach(but=>{
                but.onclick = ()=>{
                    mode = but.innerText
                    button.onclick()
                }
            })
        })
    }
})


document.getElementById('getAccess').onclick()