// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .    setup  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

let blockchain, gui
const ipaddr = 'localhost:8989'//'192.168.1.252:8989'//'labs.brangerbriz.com:2222'
const socket = io.connect(`https://${ipaddr}`)
let w = innerWidth, h = innerHeight, f = 4 // frustum size

// --------------------------
// block chain animation scene
// --------------------------
const scene = new THREE.Scene()
// camera = new THREE.PerspectiveCamera( 50, w/h, 1, 10000 ) // for debug
const camera = new THREE.OrthographicCamera(
    f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )
const renderer = new THREE.WebGLRenderer()
renderer.setSize( w, h )
document.body.appendChild( renderer.domElement )

// --------------------------
// new block animation scene
// --------------------------
const MB = new BlockMined({
    selector:'#minedBlock',
    camFrustum: f
})

// --------------------------
// animation loop
// --------------------------
function draw() {
    requestAnimationFrame( draw )
    TWEEN.update()
    renderer.render(scene, camera)
    if(MB.animating) MB.render()
}

draw()

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .   events  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

// setup scene (blockchain/gui/camera) on blockchain-data
socket.on('blockchain-data', function(data) {
    blockchain = new Blockchain({
        speed: 500, // animation transition speed in ms
        height: data.height,
        messageIndexes: data.blocklist,
        sfw: true,
        scene: scene,
        ip: ipaddr,
        getAuthHeaders: getAuthHeaders
    })

    blockchain.init( scene )

    camera.position.x = camera.position.y = camera.position.z = 3
    camera.lookAt( blockchain.firstBlockXYZ() )
    camera.position.z = 4.5
    camera.position.y = 3.5

    gui = new Vue({
        el: '#gui',
        data: { blockchain, camera },
        created:function(){
            blockchain.getCurrentBlockInfo((block)=>{
                gui.$refs.nfo.show(block)
                blockchain.getCurrentBlockMessages((messages)=>{
                    gui.$refs.tx.show(block,messages)
                })
            })
        }
    })

    blockchain.cntrlData = gui.$refs.cntrl

    draw()
})

// this will be received when a node receives a new block
socket.on('received-block', function(data) {
    blockchain.height = data.height
    MB.newBlock(data)
})

// this will be fired every 10 seconds
socket.on('peer-info', function(data) {
    if(typeof gui !=="undefined" && gui.$refs.cntrl){
        let addrs = data.map(p=>p.addr)
        // gui.$refs.cntrl.peers = addrs
        gui.$refs.cntrl.updatePeers(addrs)
    }
})

// this will be received when a node receives an unconfirmed transaction
socket.on('received-tx', function(data) {
    // console.log('received-tx:', data)
    if(typeof gui !=="undefined" && gui.$refs.cntrl){
        gui.$refs.cntrl.mempool++
    }
})

// for debugging
function logBlock(idx){
    if(typeof idx=="undefined")
        blockchain.getCurrentBlockInfo(d=>console.log(d))
    else fetch(
        `https://${ipaddr}/api/block?index=${idx}`,
        { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(data => { console.log(data) })
    .catch(err=>{ console.error(err) })
}

function logMessages(idx){
    if(typeof idx=="undefined")
        blockchain.getCurrentBlockMessages(m=>console.log(m))
    else fetch(
        `https://${ipaddr}/api/block/messages?index=${idx}`,
        { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(data => { console.log(data) })
    .catch(err=>{ console.error(err) })
}


// NOTE
// blockchain.messageIndexes = {all:[], valid:[], sfw:[], bookmarked:[]}
// blockchain.filteredIndexes: indexes to show based on both filter search / tags
// gui.valid: whether to show valid (human readable) or all messages
