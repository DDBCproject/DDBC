Vue.component('nav-arrow', {
    data:function(){return {
        opacity:1,
        top:0
    }},
    props:{
        DataType:String,
        DataBc:Object,
        DataCam:Object
    },
    mounted:function(){
        let b = this.DataBc.blocks[0].position
        let p = new THREE.Vector3( b.x, b.y, b.z )
        // via: https://stackoverflow.com/a/27448966/1104148
        let vec = p.project(this.DataCam)
        this.top =  -(vec.y - 1) / 2 * innerHeight - (innerWidth/11)
    },
    methods:{
        css:function(){
            let show = 'block'
            if( gui ){
                show = (gui.$refs.cntrl.viewing=='main') ? 'block' : 'none'
            }

            let props = {
                opacity:this.opacity,
                cursor:'pointer',
                position:'absolute',
                'z-index':10,
                top:this.top+"px",
                height:'150px',
                display:show
            }

            if(this.DataType=='left') props.left="50px"
            else if(this.DataType=='right') props.right="50px"

            return props
        },
        after:function(times,func){
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments)
                }
            }
        },
        shift:function(){
            let block, messages
            let blockchain = this.DataBc
            let filters = {
                valid:blockchain.validOnly,
                searchTerm:gui.$refs.cntrl.searchFilter,
                tags:gui.$refs.cntrl.tags
            }

            this.opacity="0.5"
            gui.$refs.nfo.hide()
            gui.$refs.tx.hide()

            const showData = this.after(3,()=>{
                this.opacity="1"
                gui.$refs.nfo.show(block)
                gui.$refs.tx.show(block,messages,filters)
            })

            if(this.DataType=="left") blockchain.shiftPrev()
            else blockchain.shiftNext()

            blockchain.getCurrentBlockInfo((data)=>{
                block=data
                showData()
            })

            blockchain.getCurrentBlockMessages((data)=>{
                messages=data
                showData()
            })

            setTimeout(showData,blockchain.speed+100)
        }
    },
    template:`<div>

        <svg viewBox="0 0 130 350"
             xmlns="http://www.w3.org/2000/svg"
             :style="css()"
             @click="shift">

            <g v-if="DataType=='left'" stroke="#ffffff" >
                <line x1="10" y1="176" x2="125" y2="0" stroke-width="10" />
                <line x1="125" y1="350" x2="10" y2="174" stroke-width="10" />
            </g>
            <g v-else stroke="#ffffff" >
                <line x1="0" y1="0" x2="125" y2="176" stroke-width="10" />
                <line x1="125" y1="174" x2="0" y2="350" stroke-width="10" />
            </g>
        </svg>

    </div>`
})
