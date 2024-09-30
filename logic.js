
const emailName = document.getElementById('emailinput')
const password = document.getElementById('passwordinput')
const loginbtn = document.getElementById('loginbtn')
const chatInput = document.querySelector(".chatBar")
const chatEnter = document.querySelector(".enterBtn")
const lgnPage = document.getElementById("lgnPage")
const msgPage = document.getElementById("msgPage")
const topBar = document.getElementById("topBar")
const infoBar = document.getElementById("loginInfo")
const infoName = document.getElementById("name")
const logOutBtn = document.getElementById('logOut')
const settingsBtn = document.getElementById('settingsBtn')


let fileToken = null
const msgContainer = document.getElementById("messages")

const chatSelect = document.getElementById("chatSelect")

const pb = new PocketBase("https://bananagc.pockethost.io/")



let currentGrp = ""

if (pb.authStore.isValid){
    lgnPage.classList.remove("current")
    msgPage.classList.add("current")

    infoBar.style.display = "flex"
    infoName.innerHTML = pb.authStore.model.username

    getGrps()
}




async function login(username, pword){

    try{
        await pb.collection('users').authWithPassword(
            username,
            pword,
        )
    
        console.log(pb.authStore.isValid)
        console.log(pb.authStore.token)
        console.log(pb.authStore.model.id)

    } catch (e){
        console.error(e)
    }
    
    return pb.authStore.isValid
    
}

function pendingMessage(msgData){

    let msg = document.createElement("div")
    let msgSender = document.createElement("div")
    let msgIcon = document.createElement("img")
    let mgsName = document.createElement("div")
    let msgTxt = document.createElement("div")

    msgIcon.classList.add("msgPfp")
    let url = pb.files.getUrl(pb.authStore.model, pb.authStore.model.avatar, {token: fileToken})

    msgIcon.src = url
            

    msg.classList.add("msg")
    msgTxt.classList.add("txt")
    msgSender.classList.add("sender")
    msg.style.opacity = '0.5'
    
    msg.classList.add("mine")
            //msg.innerHTML = msgData.expand.sender.username + ": " + msgData.msg

    msgTxt.innerHTML = msgData
    mgsName = pb.authStore.model.username

    msgSender.append(msgIcon)
    msgSender.append(mgsName)
    msg.append(msgSender)
    msg.append(msgTxt)
    msgContainer.insertBefore(msg, msgContainer.firstChild)
    msgContainer.scrollTo(0, msgContainer.scrollHeight)
    return msg
}

function createMsg(msgData, isNew){

    let msg = document.createElement("div")
    let msgSender = document.createElement("div")
    let msgIcon = document.createElement("img")
    let mgsName = document.createElement("div")
    let msgTxt = document.createElement("div")
            

    msg.classList.add("msg")
    msgTxt.classList.add("txt")
    msgSender.classList.add("sender")
    msgIcon.classList.add("msgPfp")

    if (msgData.sender == pb.authStore.model.id){
        msg.classList.add("mine")
    }
            //msg.innerHTML = msgData.expand.sender.username + ": " + msgData.msg

    msgTxt.innerHTML = msgData.msg
    mgsName = msgData.expand.sender.username
    

    let url = pb.files.getUrl(msgData.expand.sender, msgData.expand.sender.avatar, {token: fileToken})

    msgIcon.src = url


    msgSender.append(msgIcon)
    msgSender.append(mgsName)
    msg.append(msgSender)
    msg.append(msgTxt)

    
    if (isNew){

        if (msgContainer.scrollTop >= -40){
            msgContainer.insertBefore(msg, msgContainer.firstChild)
            msgContainer.scrollTo(0, msgContainer.scrollHeight)
        }
        
        
    } else if(!isNew){
        msgContainer.append(msg)
    }

    
    
}

async function getMsg(grp){

    msgContainer.innerHTML = ""

    

    try {
        let gmsg = await pb.collection("messages").getFullList({
            filter: "group.id = '" + grp + "'",
            expand: "sender",
            sort: "-created"
        })

        console.log(gmsg)

        gmsg.forEach((msgData) =>{
            createMsg(msgData, false)
        })

        
        msgContainer.scrollTo(0, msgContainer.scrollHeight)
    } catch (error) {
        console.error(error)
    }
    
}

async function getGrps(){
    try {
        
        const grps = await pb.collection("groups").getFullList()
        fileToken = await pb.files.getToken()

        
        grps.forEach(group => {
            let icon = false
            let grpItem = document.createElement("div")
            let grpName = document.createElement("div")
            let grpIcon = document.createElement("img")
            let grpIconPlaceHolder = document.createElement("div")
            grpIconPlaceHolder.classList.add("material-symbols-outlined")
            grpIconPlaceHolder.classList.add("iconPlaceHolder")

            grpIconPlaceHolder.innerHTML = "groups"

            grpName.innerHTML = group.name
            grpIcon.style.width = "50px"
            grpIcon.style.height = "50px"
            grpIcon.style.borderRadius = "50%"
            grpIcon.style.marginLeft = "10px"
            grpName.style.flexGrow = "1"
            grpName.style.paddingLeft = "10px"

            
            let url = pb.files.getUrl(group, group.icon, {'token': fileToken})
            console.log(url)
            if (url != ''){
                grpIcon.src = url
                grpItem.append(grpIcon)
                grpName.style.paddingLeft = "10px"
                icon = true
            } else {
                grpItem.append(grpIconPlaceHolder)
                icon = false
            }
            

            grpItem.classList.add("groupItem")
            
            grpItem.append(grpName)

            chatSelect.append(grpItem)

            grpItem.addEventListener("click", () => {
                getMsg(group.id)
                console.log(group.name)
                currentGrp = group.id

                topBar.style.display = "flex"

                if (icon == true){
                    topBar.querySelector("#placeHolderIcn").style.display = "none"
                    topBar.querySelector("#icon").style.display = "flex"
                    topBar.querySelector("#icon").querySelector("img").src = url
                } else if (icon == false){
                    topBar.querySelector("#icon").style.display = "none"
                    topBar.querySelector("#placeHolderIcn").style.display = "flex"
                }

                
                
                topBar.querySelector('#grpname').innerHTML = group.name
                
            })
            
        });

        
    } catch (error) {
        console.error(error)
    }
}

async function sendMSG(message){

    let msgItem = pendingMessage(message)

    await pb.collection('messages').create({
        "group": currentGrp,
        "sender": pb.authStore.model.id,
        "msg": message
        
    }, {requestKey: null})
    
    msgItem.style.opacity = '1'
    
}

chatEnter.addEventListener("click", () => {
    if (chatInput.value.trim().length != 0){
        sendMSG(chatInput.value)
    }
    chatInput.value = ""
})

loginbtn.addEventListener('click', () => {
    if (emailName.value.trim().length != 0 && password.value.trim().length != 0) {
        login(emailName.value, password.value).then((loggedIn) => {
            if (loggedIn){
                console.log("logged in baby")

                lgnPage.classList.remove("current")
                msgPage.classList.add("current")
                infoBar.style.display = "flex"
                infoName.innerHTML = pb.authStore.model.username

                if (Notification.permission === "default"){
                    Notification.requestPermission().then((perm)=>{
                        if (perm === "granted"){
                            new Notification("You will now recieve notifications", {
                                body: "You can turn this off anytime in settings"
                            })
                        }
                        
                    })
                    
                }

                
                
                getGrps()
            }
        })
    } 
})

pb.collection('messages').subscribe('*', (msgData) => {
    if (msgData.record.group != currentGrp || msgData.record.sender == pb.authStore.model.id){
        return
    }

    
    console.log(msgData.record)

    createMsg(msgData.record, true)
}, {"expand": "sender"})

document.addEventListener('keypress', (event)=> {
    if (event.key == "Enter"){
        if (chatInput.value.trim().length != 0){
            sendMSG(chatInput.value)
        }
        chatInput.value = ""
    }
})

msgContainer.addEventListener('scrollend', ()=>{
    console.log(msgContainer.scrollTop)
})

logOutBtn.addEventListener('click', ()=>{
    pb.authStore.clear()
    location.reload()
})
