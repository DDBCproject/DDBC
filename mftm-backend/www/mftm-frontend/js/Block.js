class Block {
    constructor( config ){
        // this.id = config.id
        this.speed = (config) ? config.speed || 500 : 500

        this.obj = new THREE.Object3D()
        this.position = this.obj.position
        this.rotation = this.obj.rotation

        this.uniforms = {
            pOrig: { type: "f", value: 0.0 },
            phase: { type: "f", value: 0.0 }
        }

        this.material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            linewidth:2,
            vertexShader:this.vertexShader(),
            fragmentShader:this.fragmentShader()
        })

        this.innerCube = new THREE.Mesh(
            new THREE.BoxGeometry(0.75,0.75,0.75), this.material )

        this.outerCube = new THREE.Line(
            this.buffLineCube(1.5), this.material )

        this.obj.add( this.innerCube )
        this.obj.add( this.outerCube )
    }

    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.- geometry + shaders
    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.

    buffLineCube( size ) {
        let h = size * 0.5
        let geometry = new THREE.BufferGeometry()
        let position = [
            -h,-h,-h, -h, h,-h,  h, h,-h,  h,-h,-h,
            -h,-h,-h, -h,-h, h, -h, h, h, -h, h,-h,
            -h, h, h,  h, h, h,  h,-h, h, -h,-h, h,
             h,-h, h,  h,-h,-h,  h, h,-h,  h, h, h,
        ]
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(position,3) )
        return geometry
    }

    vertexShader(){
        return `
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

    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-. utils
    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
    norm(value, min, max){ return (value - min) / (max - min) }
    lerp(norm, min, max){ return (max - min) * norm + min }
    clamp(value, min, max){ return Math.max(min, Math.min(max, value)) }
    map(value, sourceMin, sourceMax, destMin, destMax){
        return this.lerp(
            this.norm(value, sourceMin, sourceMax), destMin, destMax
        )
    }
    log(){ console.log(this.position.x) }

    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.- public
    // .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.

    shimmer(){
        let d = Math.sin(Date.now()*0.003)
        let v = this.uniforms.phase.value
        let o = this.uniforms.pOrig.value
        this.uniforms.phase.value = this.map(d+v,-3,3,o-0.25,o+0.25)
    }

    growCube(){
        new TWEEN.Tween(this.innerCube.scale)
            .to({ x:1.25, y:1.25, z:1.25 }, this.speed)
            .easing(TWEEN.Easing.Exponential.In)
            .start()
    }

    shrinkCube(){
        new TWEEN.Tween(this.innerCube.scale)
            .to({ x:1, y:1, z:1 }, this.speed)
            .easing(TWEEN.Easing.Exponential.In)
            .start()
    }

    setPhase(pX){
        // set the shading/phase color
        // w/out running the rest of update()
        pX = (pX) ? pX : this.position.x
        new TWEEN.Tween(this.uniforms.phase)
            .to({ type: "f", value: pX/6 }, this.speed)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start()
    }

    update(dir){
        let pX = this.position.x + (1.5*dir)
        let rz = this.innerCube.rotation.z + Math.PI * (0.5*-dir)

        if( dir > 0 ){ // fwd
            if( this.position.x == 0 ){
                this.shrinkCube(); pX += 1.5
            } else if( this.position.x == -3 ){
                this.growCube(); pX += 1.5
            }
        } else { // bwd
            if( this.position.x == 3 ){
                this.growCube(); pX -= 1.5
            } else if( this.position.x == 0 ){
                this.shrinkCube(); pX -= 1.5
            }
        }

        new TWEEN.Tween(this.position)
            .to({ x:pX, y:0, z:0 }, this.speed)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            // .onUpdate(callback)
            .start()

        new TWEEN.Tween(this.uniforms.phase)
            .to({ type: "f", value: pX/6 }, this.speed)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start()

        if( pX !== 0 ){
            new TWEEN.Tween(this.innerCube.rotation)
                .to({ x:0, y:0, z:rz }, this.speed)
                .easing(TWEEN.Easing.Sinusoidal.Out)
                .start()
        }
    }

}
