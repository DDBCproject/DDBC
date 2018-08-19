class BlockMined {
    constructor(config){
        this.ele = document.querySelector(config.selector)
        this.ele.style.opacity = 0.0
        this.ele.style.display = "none"
        this.animating = false
        this.txCap = 1000

        // text textContent
        this.callEle = document.createElement('div')
        this.callEle.style.position = "fixed"
        this.callEle.style.top = "50%"
        this.callEle.style.width = "100%"
        this.callEle.style.textAlign = "center"
        this.callEle.style.fontSize = "32px"
        this.callEle.style.color = "#000"
        this.callEle.textContent = "A new block was just added to the blockchain!"
        this.ele.appendChild(this.callEle)
        this.callEle.style.marginTop = -this.callEle.offsetHeight/2+"px"
        this.callEle.style.opacity = 0

        this.infoEle = document.createElement('div')
        this.infoEle.style.position = "fixed"
        this.infoEle.style.top = "50%"
        this.infoEle.style.width = innerWidth*0.20+"px"
        this.infoEle.style.left = innerWidth*0.70+"px"
        this.infoEle.style.padding = "0px 20px"
        this.ele.appendChild(this.infoEle)

        // sprite canvas
        this.canvas = document.createElement('canvas')
        this.canvas.width = 375
        this.canvas.height = 25
        this.ctx = this.canvas.getContext('2d')

        // three.js stuff
        let f = (config.camFrustum) ? config.camFrustum : 4
        this.w = innerWidth
        this.h = innerHeight
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( 255, 255, 255 )
        this.camera = new THREE.OrthographicCamera(
            f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize( w, h )
        document.querySelector(config.selector)
                .appendChild( this.renderer.domElement )

        this.camera.position.x = 3
        this.camera.position.y = 3
        this.camera.position.z = 3

        this.uniforms = {
            phase: { type: "f", value: 0.0 }
        }

        this.material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            linewidth:2,
            vertexShader:this.vertexShader(),
            fragmentShader:this.fragmentShader()
        })
    }

    buffLineCube( size, side ) {
        let h = size * 0.5
        let geometry = new THREE.BufferGeometry()

        let position = (side=="A") ?
            [
                -h,-h,-h, -h, h,-h,  h, h,-h,  h,-h,-h,
                -h,-h,-h, -h,-h, h, -h, h, h, -h, h,-h,
            ] : [
                h,-h, h, -h,-h, h, -h, h, h,  h, h, h,
                h,-h, h,  h,-h,-h,  h, h,-h,  h, h, h
            ]
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(position,3) )
        return geometry
    }

    vertexShader(){
        return `
        uniform float phase;
        varying vec3 vp;

        void main() {
            vec3 trans = vec3(position);
            vec4 mvPos = modelViewMatrix * vec4(trans,1.0);
            gl_Position = projectionMatrix * mvPos;
            vp = -mvPos.xyz;
        }`
    }

    fragmentShader(){
        return `
        #extension GL_OES_standard_derivatives : enable

        uniform float phase;
        varying vec3 vp;

        void main() {
            vec3 fdx = vec3(dFdx(vp.x), dFdx(vp.y), dFdx(vp.z));
            vec3 fdy = vec3(dFdy(vp.x), dFdy(vp.y), dFdy(vp.z));
            vec3 fdz = vec3(dFdy(vp.y), dFdx(vp.z), dFdy(vp.y));
            vec3 fdxy = refract( fdx, fdz, 0.0 );
            vec3 norm = normalize( fdxy );
            float x = norm.x;
            float y = norm.y + phase;
            float z = norm.z * 6.0 + 1.25;
            gl_FragColor = vec4( x, y, z, 1.0 );
        }`
    }

    createSpriteMap(str){
        let w = this.canvas.width
        let h = this.canvas.height
        this.ctx.clearRect(0,0,w,h)
        this.ctx.font = '20px Source_Code'
        this.ctx.fillStyle = '#000'//'#fff'
        this.ctx.textBaseline = 'top'
        this.ctx.fillText(str, 0,0)
        return this.canvas.toDataURL()
    }

    shortTx(t){
        let val = t.vout.map(o=>o.value).reduce((a,b)=>a+b)
        let rnd = Math.round(val*10000)/10000

        let a = t.hash.split('')
        let p1 = a.slice(0,10).join('')
        let p2 = a.slice(a.length-11,a.length-1).join('')

        return `${rnd} BTC, ${p1}...${p2}`
    }

    makeTxSprites(data){
        let _tx = (data.tx.length > this.txCap) ?
            data.tx.slice(0,this.txCap) : data.tx

        _tx.forEach(tx => {
            let imgData = this.createSpriteMap( this.shortTx(tx) )
            let map = new THREE.TextureLoader().load( imgData )
            let mat = new THREE.SpriteMaterial({
                map: map,
                transparent:true,
                opacity:0,
                color: 0xffffff
            })
            let sprite = new THREE.Sprite( mat )
            sprite.scale.y = 1/15
            sprite.position.x = Math.random()*10-5
            sprite.position.y = Math.random()*10-5
            sprite.position.z = Math.random()*10-5
            this.sprites.push( sprite )
        })
    }

    newBlock(data){
        this.sideA = new THREE.Line(
            this.buffLineCube(2,"A"), this.material )
        this.sideA.geometry.setDrawRange( 0, 1 )

        this.sideB = new THREE.Line(
            this.buffLineCube(2,"B"), this.material )
        this.sideB.geometry.setDrawRange( 0, 1 )

        this.block = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1), this.material )
        this.block.scale.x = 0
        this.block.scale.y = 0
        this.block.scale.z = 0

        this.sprites = []

        this.ele.style.display = "block"
        this.ele.style.opacity = 0.0
        new TWEEN.Tween(this.ele.style)
            .to({ opacity:1.0 }, 1000)
            .easing(TWEEN.Easing.Exponential.In)
            .onComplete(()=>{
                this.makeTxSprites(data)
                this.animating = true
                this.sprites.forEach(s=>this.scene.add(s))
                this.scene.add( this.block )
                this.scene.add( this.sideA )
                this.scene.add( this.sideB )
                this.camera.lookAt( this.block.position )
                this.animate(data)
            }).start()
    }

    drawWireFrame(range,goal){
        range++
        this.sideA.geometry.setDrawRange( 0, range )
        this.sideB.geometry.setDrawRange( 0, range )
        if( range < goal ){
            setTimeout(()=>{ this.drawWireFrame(range,goal) },50)
        }
    }

    updateText(data){
        let hash = document.createElement('div')
        hash.style.borderBottom = "2px solid #fff"
        hash.style.paddingBottom = "4px"
        hash.style.marginBottom = "4px"
        let t = document.createElement('b')
        t.textContent = "hash/id:"
        let s = document.createElement('a')
        s.style.overflowWrap = 'break-word'
        s.textContent = data.hash
        hash.appendChild(t)
        hash.appendChild(s)

        let str = ''
        let info = document.createElement('div')
        str += `This block is the ${data.height} block to be added to the bitcoin blockchain, `
        str += `and includes a total of ${data.tx.length} transactions.`
        info.textContent = str

        this.infoEle.appendChild(hash)
        this.infoEle.appendChild(info)
        this.infoEle.style.marginTop = - this.infoEle.offsetHeight/2 + 'px'
    }

    fadeCallEe(){
        let o = Number(this.callEle.style.opacity)
        this.callEle.style.opacity = o - 0.05
        if( o > 0 ){
            setTimeout(()=>{ this.fadeCallEe() },50)
        }
    }

    animate(data){

        new TWEEN.Tween(this.scene.background)
            .to({ r:0, g:0, b:0 }, 16000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()

        this.callEle.style.opacity = 0.0
        new TWEEN.Tween(this.callEle.style)
            .to({ opacity:1.0 }, 1000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(()=>{
                this.callEle.style.opacity = 1.0
                setTimeout(()=>{
                    this.fadeCallEe()
                    // tween all the sprites
                    this.sprites.forEach(s=>{s.material.opacity = 1})
                    this.sprites.forEach( s => {
                        new TWEEN.Tween(s.position)
                            .to({ x:0, y:0, z:0 }, 10000)
                            .easing(TWEEN.Easing.Sinusoidal.In)
                            .onComplete(()=>{
                                s.scale.x = s.scale.y = s.scale.z = 0
                                this.drawWireFrame(1,8)
                            })
                            .start()
                    })
                },3000)
            })
            .start()

        setTimeout(()=>{
            new TWEEN.Tween(this.block.scale)
                .to({ x:1, y:1, z:1 }, 2000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start()
            new TWEEN.Tween(this.block.rotation)
                .to({ x:0, y:Math.PI*2, z:0 }, 3000)
                .easing(TWEEN.Easing.Exponential.Out)
                .start()
        },14000)

        setTimeout(()=>{
            this.updateText(data)
            new TWEEN.Tween(this.infoEle.style)
                .to({ opacity:1 }, 2000)
                .easing(TWEEN.Easing.Cubic.In)
                .start()
        },15000)

        setTimeout(()=>{
            this.reset()
        },22000)
    }

    reset(){
        let o = Number(this.ele.style.opacity)
        this.ele.style.opacity = o - 0.05
        if( o > 0 ){
            setTimeout(()=>{ this.reset() },50)
        } else {
            this.ele.style.display = 'none'
            this.animating = false
            this.infoEle.innerHTML = ""
            this.infoEle.style.opacity = 0.0
            for( let i = this.scene.children.length - 1; i >= 0; i--) {
                this.scene.remove( this.scene.children[i] )
            }
            this.scene.background.setRGB(255,255,255)
            this.renderer.render(this.scene, this.camera)
        }
    }


    render(){
        this.renderer.render(this.scene, this.camera)
    }
}
