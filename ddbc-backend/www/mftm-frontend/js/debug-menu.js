let showBtn = document.querySelector('#hiddenBtn')
let closeBtn = document.querySelector('#close')
let menu = document.querySelector('#hiddenMenu')
let restartBtn = document.querySelector('#restart')
let nsfwBtn = document.querySelector('#nsfwToggle')
let tnBlock = document.querySelector('#testNewBlock')
let consoleDump = document.querySelector('#consoleDump')

showBtn.addEventListener('click',()=>{
    menu.style.display = "block"
})

closeBtn.addEventListener('click',()=>{
    menu.style.display = "none"
})

tnBlock.addEventListener('click',()=>{
    fetch(`js/test-block.json`)
    .then(res => res.json())
    .then(data => {
        MB.newBlock(data)
        menu.style.display = "none"
    })
    .catch(err=>{ console.error(err) })
})

restartBtn.addEventListener('click',()=>{
    window.location.reload()
    // if(gui.fart.test) console.log('test')
})

nsfwBtn.addEventListener('click',()=>{
    blockchain.sfwOnly = !blockchain.sfwOnly
    if(blockchain.sfwOnly) nsfwBtn.textContent = 'show nsfw'
    else nsfwBtn.textContent = 'censor nsfw'
})

window.addEventListener('error',(err)=>{
    // console.log(err)
    let path = err.filename.split('/')
    let file = path[path.length-1]
    let str = `ERR:${file}:${err.lineno}:${err.colno}: ${err.message}\n`
    if(err.error) str += `${err.error}\n`
    consoleDump.textContent += str
    return true
})
