Vue.component('block-info', {
    data:function(){return {
        anim:0, // animation percentage
        coords:{x:0,y:0,z:0}, // coordinates of currently selected block Mesh
        block:{ // block data
            hash:'x',
            height:0,
            time:0,
            tx:[{
                hash:'x',
                vin:[{coinbase:'x'}],
                vout:[{value:0}]
            }]
        }
    }},
    props:{
        DataBc:Object,
        DataCam:Object
    },
    mounted:function(){
        let b = this.DataBc.blocks[0].position
        let p = new THREE.Vector3( b.x, b.y, b.z )

        // via: https://stackoverflow.com/a/27448966/1104148
        let vec = p.project(this.DataCam)
            vec.x = (vec.x + 1) / 2 * innerWidth + (innerHeight/3.95)
            vec.y = -(vec.y - 1) / 2 * innerHeight - (innerWidth/11)

        this.coords = {
            x: vec.x,
            y: vec.y
        }
    },
    computed:{
        circleCSS:function(){
            return {
                position:'absolute',
                'z-index':10,
                // left:this.coords.x+170+"px",
                // top:this.coords.y-117+"px",
                left:this.coords.x+"px",
                top:this.coords.y+"px",
                height:'30px'
            }

        },
        lineCSS:function(){
            return {
                position:'absolute',
                'z-index':10,
                left:this.coords.x+13+"px",
                top:this.coords.y-184+"px",
                height:'200px'
            }
        },
        textCSS:function(){
            return {
                opacity:this.anim,
                position:'absolute',
                'z-index':10,
                left:this.coords.x+330+"px",
                top:this.coords.y-178+"px",
                height:'200px'
            }
        },
        hashURL:function(){
            let b = 'https://blockchain.info/block-index/1654382/'
            return `${b}${this.block.hash}`
        }
    },
    methods:{
        lineVB:function(){
            return `0 0 ${150*this.anim} 50`
        },
        getDate:function(time){
            let date = new Date(time*1000)
            let Y = date.getUTCFullYear()
            let M = date.getUTCMonth()+1
            let D = date.getUTCDate()
            let h = date.getUTCHours()
            let m = "0" + date.getUTCMinutes()
            let s = "0" + date.getUTCSeconds()
            return `${D}/${M}/${Y} ${h}:${m.substr(-2)}:${s.substr(-2)}`
        },
        show:function(block){
            if(block) this.block = block
            this.anim+=0.2
            if(this.anim<1) setTimeout(this.show,50)
            else if(this.anim>1) this.anim=1
        },
        hide:function(){
            this.anim-=0.5
            if(this.anim>0) setTimeout(this.hide,50)
            else if(this.anim<0) this.anim=0
        }
    },
    template:`<div>
        <svg viewBox="0 0 100 100"
             xmlns="http://www.w3.org/2000/svg"
             :style="circleCSS">
            <circle fill="#ffffff" cx="50" cy="50" :r="50*anim"/>
        </svg>

        <svg :viewBox="lineVB()"
             xmlns="http://www.w3.org/2000/svg"
             :style="lineCSS">
            <g stroke="#ffffff" >
                <line x1="0" y1="50" x2="75" y2="10" stroke-width="1" />
                <line x1="75" y1="10" x2="150" y2="10" stroke-width="1" />
            </g>
        </svg>

        <section :style="textCSS">
            <div><b>block number:</b> {{block.height}}</div>
            <div style="height:15px"></div>
            <div><b>mined on:</b> {{getDate(block.time)}}</div>
            <a :href="hashURL" target="_blank">
                <div style="max-width:283px;word-wrap:break-word;">
                    <b>hash/id:</b><span style="padding:0px 5px"></span>{{block.hash}}
                </div>
            </a>
        </section>
    </div>`
})
