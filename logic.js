
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
const replyPreview = document.getElementById("replyPreview")
const cancelReply = document.getElementById("cancelReply")
const bottomBar = document.querySelector('.bottomBar')
const backBtn = document.getElementById('backToGrps')
var screenWidth = window.matchMedia("(max-width: 500px)")

let fileToken = null
const msgContainer = document.getElementById("messages")

const chatSelect = document.getElementById("chatSelect")

const pb = new PocketBase("https://bananagc.pockethost.io/")



var currentGrp = ""
var replyMsg = ""
var replyMsgContent = {msg: "", sender: ""}

async function startApp(){

    if (pb.authStore.isValid){
        lgnPage.classList.remove("current")
        await pb.collection('users').authRefresh()
        
        msgPage.classList.add("current")

        infoBar.style.display = "flex"
        infoName.innerHTML = pb.authStore.model.username

        getGrps()
    }

}



async function login(username, pword){

    try{
        await pb.collection('users').authWithPassword(
            username,
            pword,
        )

    } catch (e){
        console.error(e)
    }
    
    return pb.authStore.isValid
    
}

cancelReply.addEventListener('click', ()=>{
    clearReply()
})

function clearReply(){
    replyPreview.querySelector('#replyContent').innerHTML = ""
    replyPreview.querySelector('#replyUserName').innerHTML = ""
    replyPreview.style.display = "none"
    replyMsg = ""
    replyMsgContent.msg = ""
    replyMsgContent.sender = ""
}

function showReply(msg, name){
    
    replyPreview.querySelector('#replyContent').innerHTML = msg
    replyPreview.querySelector('#replyUserName').innerHTML = "-" + name
    replyPreview.style.display = "flex"
}

function pendingMessage(msgData){

    let msg = document.createElement("div")
    let msgSender = document.createElement("div")
    let msgIcon = document.createElement("img")
    let mgsName = document.createElement("div")
    let msgTxt = document.createElement("div")
    let replyBtn = document.createElement("div")
    let horizontal = document.createElement("div")
    let txtContainer = document.createElement("div")
    let replyTxt = document.createElement("div")

    msgIcon.classList.add("msgPfp")
    let url = pb.files.getUrl(pb.authStore.model, pb.authStore.model.avatar, {token: fileToken})

    msgIcon.src = url
            
    replyTxt.classList.add("replyTxt")
    msg.classList.add("msg")
    msgTxt.classList.add("txt")
    msgSender.classList.add("sender")
    msgTxt.style.opacity = '0.5'
    replyBtn.classList.add("material-symbols-outlined")
    replyBtn.classList.add("replyBtn")
    replyBtn.innerHTML = "reply"
    horizontal.classList.add("horizontal")
    
    msg.classList.add("mine")
            //msg.innerHTML = msgData.expand.sender.username + ": " + msgData.msg

    msgTxt.innerHTML = msgData
    mgsName = pb.authStore.model.username

    if (replyMsgContent.msg != "" || replyMsgContent.sender != ""){
        replyTxt.innerHTML = replyMsgContent.msg + ' -' + replyMsgContent.sender
        txtContainer.append(replyTxt)
    }

    txtContainer.append(msgTxt)
    msgSender.append(msgIcon)
    msgSender.append(mgsName)
    horizontal.append(txtContainer)
    horizontal.append(replyBtn)
    msg.append(msgSender)
    msg.append(horizontal)

    msg.addEventListener("mouseover", ()=>{
        if(msgTxt.style.opacity == '1'){
            replyBtn.style.visibility = "visible"
        }
        
    })

    msg.addEventListener("mouseleave", ()=>{
        if(replyBtn.style.visibility == "visible"){
            replyBtn.style.visibility = "hidden"
        }
        
    })

    msgContainer.insertBefore(msg, msgContainer.firstChild)
    msgContainer.scrollTo(0, msgContainer.scrollHeight)
    return msg
}

function createMsg(msgData, isNew){

    let msg = document.createElement("div")
    let msgSender = document.createElement("div")
    let msgIcon = document.createElement("img")
    let msgName = document.createElement("div")
    let msgTxt = document.createElement("div")
    let replyBtn = document.createElement("div")
    let horizontal = document.createElement("div")
    let txtContainer = document.createElement("div")
    let replyTxt = document.createElement("div")

    
    msg.classList.add("msg")
    msgTxt.classList.add("txt")
    msgSender.classList.add("sender")
    msgIcon.classList.add("msgPfp")
    replyBtn.classList.add("material-symbols-outlined")
    replyBtn.classList.add("replyBtn")
    replyBtn.innerHTML = "reply"
    horizontal.classList.add("horizontal")
    replyTxt.classList.add("replyTxt")

    if (msgData.sender == pb.authStore.model.id){
        msg.classList.add("mine")
    }
            //msg.innerHTML = msgData.expand.sender.username + ": " + msgData.msg

    msgTxt.innerHTML = msgData.msg
    msgName.innerHTML = msgData.expand.sender.username
    

    let url = pb.files.getUrl(msgData.expand.sender, msgData.expand.sender.avatar, {token: fileToken})

    msgIcon.src = url

    if (msgData.expand.reply != null){
        replyTxt.innerHTML = msgData.expand.reply.msg + ' -' + msgData.expand.reply.expand.sender.username
        txtContainer.append(replyTxt)
    }
    
    txtContainer.append(msgTxt)
    msgSender.append(msgIcon)
    msgSender.append(msgName)
    horizontal.append(txtContainer)
    horizontal.append(replyBtn)
    msg.append(msgSender)
    msg.append(horizontal)
    

    
    if (isNew){

        if (msgContainer.scrollTop >= -40){
            msgContainer.insertBefore(msg, msgContainer.firstChild)
            msgContainer.scrollTo(0, msgContainer.scrollHeight)
        }
        
        
    } else if(!isNew){
        msgContainer.append(msg)
    }

    msg.addEventListener("mouseover", ()=>{
        replyBtn.style.visibility = "visible"
    })

    msg.addEventListener("mouseleave", ()=>{
        replyBtn.style.visibility = "hidden"
    })

    replyBtn.addEventListener('click', ()=>{
        showReply(msgData.msg, msgData.expand.sender.username)
        replyMsg = msgData.id
        replyMsgContent.msg = msgData.msg
        replyMsgContent.sender = msgData.expand.sender.username
        
    })
    
}

async function getMsg(grp){

    msgContainer.innerHTML = ""

    

    try {
        let gmsg = await pb.collection("messages").getFullList({
            filter: "group.id = '" + grp + "'",
            expand: "sender,reply.sender",
            sort: "-created"
        })

       

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
                
                currentGrp = group.id

                topBar.style.display = "flex"
                bottomBar.style.display = "flex"

                if (icon == true){
                    topBar.querySelector("#placeHolderIcn").style.display = "none"
                    topBar.querySelector("#icon").style.display = "flex"
                    topBar.querySelector("#icon").querySelector("img").src = url
                } else if (icon == false){
                    topBar.querySelector("#icon").style.display = "none"
                    topBar.querySelector("#placeHolderIcn").style.display = "flex"
                }

                if (screenWidth.matches){
                    document.getElementById('chat').style.left = '-100vw'
                    document.getElementById('leftPane').style.left = '-30vw'
                }
                clearReply()
                topBar.querySelector('#grpname').innerHTML = group.name
                
            })
            
        });

        
    } catch (error) {
        console.error(error)
    }
}

async function sendMSG(message){

    var msgItem = pendingMessage(message)

    var msgRecord = await pb.collection('messages').create({
        "group": currentGrp,
        "sender": pb.authStore.model.id,
        "msg": message,
        "reply": replyMsg
        
    }, {requestKey: null, expand: "sender"})

    msgReply = msgItem.querySelector('.replyBtn')

    msgReply.addEventListener('click', ()=>{
        showReply(msgRecord.msg, msgRecord.expand.sender.username)
        replyMsg = msgRecord.id
        replyMsgContent.msg = msgRecord.msg
        replyMsgContent.sender = msgRecord.expand.sender.username
        
    })
    
    msgText = msgItem.querySelector('.txt')
    msgText.style.opacity = '1'
    
}

chatEnter.addEventListener("click", () => {
    if (chatInput.value.trim().length != 0){
        sendMSG(chatInput.value)
    }
    chatInput.value = ""
    clearReply()
})

loginbtn.addEventListener('click', () => {
    if (emailName.value.trim().length != 0 && password.value.trim().length != 0) {
        login(emailName.value, password.value).then((loggedIn) => {
            if (loggedIn){
                

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
    
    if (msgData.record.group == currentGrp && msgData.record.sender != pb.authStore.model.id){
        createMsg(msgData.record, true)
    }

    if (Notification.permission === "granted"){
        

        if (document.hidden || (msgData.record.group != currentGrp && msgData.record.sender != pb.authStore.model.id)){
            new Notification(msgData.record.expand.sender.username + " messaged in " + msgData.record.expand.group.name, {
                body: msgData.record.msg
            })
        } 
        
    }
}, {"expand": "sender,group,reply.sender"})

document.addEventListener('keypress', (event)=> {
    if (event.key == "Enter"){
        if (chatInput.value.trim().length != 0){
            sendMSG(chatInput.value)
        }
        chatInput.value = ""
        clearReply()
    }
})

logOutBtn.addEventListener('click', ()=>{
    pb.authStore.clear()
    location.reload()
})

backBtn.addEventListener('click', ()=>{
    if (screenWidth.matches){
        document.getElementById('chat').style.left = '0'
        document.getElementById('leftPane').style.left = '0'
    }
})

startApp()