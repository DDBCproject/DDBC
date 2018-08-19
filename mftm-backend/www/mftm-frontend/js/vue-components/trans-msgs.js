Vue.component('trans-msgs', {
    data:function(){return {
        anim:0, // animation percentage
        abbreviate:false,
        messages:null, /* null || Array w/Objects:
            annotation:String,
            block_timestamp:String,
            data:String,
            nsfw:Boolean,
            tags:Array,
            transaction_hash:String,
            type:String(ex: coinbase message)
        */
        block:{ // block data
            hash:'x',
            height:0,
            time:0,
            tx:[{
                hash:'x',
                vin:[{coinbase:'x'}],
                vout:[{value:0}]
            }]
        },
        lazyTx:[], // lazy loaded transactions (updates on scroll)
        abbrTx:[] // abbreviated transactions (only exapnd message txs)
    }},
    props:{
        DataBc:Object // blockchain
    },
    computed:{
        secCSS:function(){
            return {
                opacity:this.anim,
                position:'absolute',
                'z-index':10,
                left:"140px",
                top:"80px",
                'max-height':'570px',
                width:'755px',
                background:'rgba(0,0,0,0.5)',
                border:'4px solid #fff',
                padding:'50px 10px 10px 10px',
                overflow: 'scroll'
            }
        },
        headerCSS:function(){
            return {
                position:'fixed',
                background:'#000',
                width:'755px',
                margin:'-50px 0px 0px -10px',
                padding:'10px',
                'border-bottom':'2px solid #fff'
            }
        },
        messageCSS:function(){
            return {
                background: 'rgba(100,100,100,0.5)',
                color: '#5ADDFF',
                padding: '8px',
                margin: '4px 0px 2px 0px'
            }
            // TODO don't wordwrap 'ascii art' or 'code'
        },
        annotationCSS:function(){
            return {
                background: 'rgba(136,0,255,1)',
                color: '#fff',
                padding: '8px',
                margin: '4px 0px 2px 0px'
            }
            // TODO don't wordwrap 'ascii art' or 'code'
        },
        abbrToggleCSS:function(){
            return {
                float:'right',
                background: '#ffffff',
                color:'#000000',
                padding:"0px 8px",
                cursor:'pointer',
                'user-select':'none'
            }
        }
    },
    methods:{
        shortHash(hash){
            let a = hash.split('')
            let p1 = a.slice(0,10).join('')
            let p2 = a.slice(a.length-11,a.length-1).join('')
            return `${p1}...${p2}`
        },
        shortBTC(t){
            let val = t.vout.map(o=>o.value).reduce((a,b)=>a+b)
            return Math.round(val*10000)/10000
        },
        hashURL:function(hash){
            return `https://blockchain.info/tx/${hash}`
        },
        txLazyLoad:function(e){
            let l = this.lazyTx.length
            if(e.target.scrollTop==e.target.scrollTopMax
                && l<this.block.tx.length){
                this.lazyTx = [...this.lazyTx,...this.block.tx.slice(l,l+25)]
            }
        },
        setupAbbrTx:function(block){
            let arr = []
            if(this.messages){
                let hashIdxz = []
                for(let m in this.messages){
                    let idx = block.tx.findIndex(t=>t.hash==m)
                    arr.push( block.tx[idx] )
                }
            }
            return arr
        },
        formatMessage:function(m){
            let msg = m.data
            let str = JSON.stringify(msg)
            str = str.substring(1, str.length-1)
            return str
        },
        formatAnnotation:function(m){
            let a = m.annotation
            if( a.indexOf('tx:')==0){
                return null
            } else {
                return a
            }
        },
        needsPre:function(m){
            return (
                m.tags.includes('ascii-art') ||
                m.tags.includes('code') ||
                m.format
            )
        },
        isCoinbase:function(t,i){
            if(this.abbreviate){
                let idMatch = this.block.tx[0].txid == t.txid
                return (i==0 && idMatch)
            } else {
                return (i==0)
            }
        },
        showHideMessage:function(){
            let diff = this.block.tx.length - this.abbrTx.length
            let sMsg = `show the ${diff} hidden transaction${(diff==1)?'':'s'}`
            let hMsg = 'hide messageless transactions'
            if(this.abbreviate) return sMsg
            else return hMsg
        },
        passFilter:function(msg,filt){
            if(!filt) filt = {}
            let show = true
            // if filtering out non-valid && message isn't valid...
            if( filt.valid && !msg.valid ) show = false
            // if filtering by tags && message doesn't contain tag...
            if( filt.tags && filt.tags.length>0 ){
                let common = msg.tags.filter(t=>filt.tags.includes(t))
                if(common.length==0) show = false
            }
            // if filtering by search term && term not in message...
            if( filt.searchTerm ){
                if( msg.data.search(filt.searchTerm)<0 ) show = false
            }
            return show
        },
        show:function(block,messages,filters){
            if(block) {
                // update block data && reset other details:
                // tx arrays + messages array + abbreviate bool
                this.block = block
                this.lazyTx = block.tx.slice(0,25)
                if(messages){
                    this.abbreviate = true
                    let d = {} // create message dictionary
                    messages.forEach((m)=>{
                        if( this.passFilter(m,filters) ){
                            if( d.hasOwnProperty(m.transaction_hash) ){
                                d[m.transaction_hash].annotation += m.annotation
                                d[m.transaction_hash].data += m.data
                                d[m.transaction_hash].tags =
                                    [...d[m.transaction_hash].tags,...m.tags]
                            } else d[m.transaction_hash] = m
                        }
                    })
                    this.messages = d
                } else {
                    this.abbreviate = false
                    this.messages = null
                }
                this.abbrTx = this.setupAbbrTx(block)
            }
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
        <section :style="secCSS" @scroll="txLazyLoad($event)">
            <div :style="headerCSS">
                transaction list
                <span :style="abbrToggleCSS" @click="abbreviate=!abbreviate">
                    {{ showHideMessage() }}
                </span>
            </div>

            <span v-if="abbreviate">

                <div v-for="(t,i) in abbrTx" :key="t.hash">
                    <span>
                        <b>hash/id:</b>
                        <a :href="hashURL(t.hash)" target="_blank">
                            {{ shortHash(t.hash) }}
                        </a>
                        <span v-if="isCoinbase(t,i)">(coinbase)</span>
                        <span style="float:right;"> {{ shortBTC(t) }} BTC </span>
                        <div v-if="DataBc.sfwOnly && messages[t.hash].nsfw" :style="annotationCSS">
                            [REMOVED: NOT SAFE FOR WORK]
                        </div>
                        <div v-else :style="messageCSS">
<pre v-if="needsPre(messages[t.hash])">
{{ messages[t.hash].data }}
</pre>
                            <span v-else>{{messages[t.hash].data}}</span>
                        </div>
                        <div v-if="messages[t.hash].annotation && formatAnnotation(messages[t.hash])" :style="annotationCSS">
                            {{formatAnnotation(messages[t.hash])}}
                        </div>
                    </span>
                </div>

            </span>
            <span v-else>

                <div v-for="(t,i) in lazyTx" :key="t.hash">
                    <b>hash/id:</b>
                    <a :href="hashURL(t.hash)" target="_blank">
                        {{ shortHash(t.hash) }}
                    </a>
                    <span v-if="isCoinbase(t,i)">(coinbase)</span>
                    <span style="float:right;"> {{ shortBTC(t) }} BTC </span>
                    <div v-if="messages && messages.hasOwnProperty(t.hash)"
                         :style="messageCSS">
                        <span v-if="DataBc.sfwOnly && messages[t.hash].nsfw">
                            [REMOVED: NOT SAFE FOR WORK]
                        </span>
<pre v-else-if="needsPre(messages[t.hash])">
{{ messages[t.hash].data }}
</pre>
                        <span v-else>{{messages[t.hash].data}}</span>
                    </div>
                </div>

            </span>

        </section>
    </div>`
})
