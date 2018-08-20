Vue.component('control-area', {
    data:function(){return {
        viewing:'main', // or tags
        mempool:0,
        peers:{},
        tagsDisplayed:'theme', // or 'lang'
        themeTags:['ad','ascii-art','birthday','chat','code','conspiracy',
            'emoticon','eulogy', 'favorite', 'hello','holiday','insult','link','love',
            'marriage','meme','meta','poetry','politics','quote','religion',
            'satoshi','signature','test','tribute','xss'],
        langTags:['arabic', 'azerbaijani', 'bengali', 'bulgarian', 'catalan',
                  'chinese', 'corsican', 'croatian', 'czech', 'dutch',
                  'english', 'esperanto', 'estonian', 'french', 'galician',
                  'german', 'greek', 'hawaiian', 'hebrew', 'hindi', 'hungarian',
                  'icelandic', 'indonesian', 'italian', 'japanese', 'korean',
                  'kyrgyz', 'latin', 'latvian', 'lithuanian', 'malay',
                  'malayalam', 'maori', 'mongolian', 'norwegian', 'persian',
                  'polish', 'portuguese', 'punjabi', 'romanian', 'russian',
                  'serbian', 'slovak', 'spanish', 'sundanese', 'swedish',
                  'tamil', 'telugu', 'turkish', 'ukrainian', 'vietnamese',
                  'welsh'],
        tags:[], // currently selected tags
        searchValue:null,
        searchFilter:null,
        searchColor:'#fff',
        valid:false,
        tl:{ // for timeline stuff
            bins:40,
            arr:[]
        },
        years:[2009,2010,2011,2012,2013,2014,2015,2016,2017,2018],
        bookmarks:[]
    }},
    props:{
        DataBc:Object // blockchain
    },

    created:function(){

        function nudgeHack(i,y,h){
            let newVal = y
            let nudges = [8,10,18,33]
            if( nudges.includes(i) ) newVal=h/2
            return newVal
        }

        let bz = this.DataBc.messageIndexes.bookmarked
        bz = bz.slice(0,40) // for testing
        this.bookmarks = bz.map((index,i)=>{
            let r = 10
            let x = (index/this.DataBc.height) * this.svgD().w
            // let y = this.svgD().h - r/2 - 10
            // let y = Math.random()*(this.svgD().h-r) + r
            // let y = Math.sin(x) * (this.svgD().h-10) + this.svgD().h/2
            let y = Math.sin(x) * (this.svgD().h/2.477) + this.svgD().h/2
            y = nudgeHack(i,y,this.svgD().h)
            return { x, y, r, index }
        })

        // this.bookmarks = this.bookmarks.map((b,i)=>{
        //     if(i>0){
        //         let p = this.bookmarks[i-1]
        //         if( p.x+b.r > b.x-b.r ){
        //             // b.x = p.x
        //             b.y = p.y-40
        //         }
        //     }
        //     return b
        // })
        // console.log(JSON.stringify(this.bookmarks))
    },
    computed:{
        secCSS:function(){
            return {
                'position':'fixed',
                'z-index':10,
                'left':'0px',
                'bottom':'0px',
                'height':'240px',
                'width':'100%',
                'background':'#000',
                'border-top': '2px solid #fff',
            }
        },
        nodeNfoCSS:function(){
            return {
                'position':'fixed',
                'z-index':11,
                'left':'0px',
                'bottom':'0px',
                'width':'100%',
                'background':'#323232',
                'color':'#fff',
                'padding': '5px',
                'display': 'flex',
                'user-select':'none'
            }
        },
        mainSecCSS:function(){
            let ml = (this.viewing=='main') ? '0px' : -innerWidth+"px"
            return {
                'position':'absolute',
                'margin-left':ml,
                'transition':'all 1s'
            }
        },
        btnsCSS:function(){
            return {
                'position': 'absolute',
                'right': `-${innerWidth-this.svgD().w-18}px`,
                'top': '18px',
                'display': 'flex',
                'flex-direction': 'column',
                'height': '161px',
                'justify-content': 'space-between',
            }
        },
        bCSS:function(){
            return {
                'background': '#8800FF',
                'padding': '8px 0px',
                'width': '400px',
                'display': 'inline-block',
                'text-align': 'center',
                'user-select':'none',
                'cursor':'pointer'
            }
        },
        inputCSS:function(){
            return {
                'border': '2px solid #8800FF',
                'padding': '10px',
                'background': '#000',
                'color': this.searchColor,
                'user-select':'none'
            }
        },
        searchBtnCSS:function(){
            return {
                'background': '#8800FF',
                'border': 'none',
                'color': '#fff',
                'padding': '8px 39px',
                'font-size': '16px',
                'font-family': "'Source_Code', monospace",
                'cursor':'pointer',
                'user-select':'none'
            }
        },
        svgCSS:function(){
            return {
                'width': this.svgD().w+'px',
                'height': this.svgD().h+'px',
                'position': 'relative',
                'left': '18px',
                'top': '18px',
            }
        },
        tagSecCSS:function(){
            let ml = (this.viewing=='tags') ? '0px' : innerWidth+"px"
            return {
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'width': '100%',
                'height': '100%',
                'background-color': '#000',
                'padding': '20px',
                'display':'flex',
                'margin-left':ml,
                'transition':'all 1s'
            }
        },
        tagsCntrlCSS:function(){
            return {
                'margin-right':'18px',
                'display': 'flex',
                'flex-direction': 'column',
                'height': '96px',
                'justify-content': 'space-between',
            }
        },
        viewbox:function(){
          return `0 0 ${this.svgD().w} ${this.svgD().h}`;
        },
        pathCSS:function(){
            return {
                'fill': '#8800FF',
                'stroke': '#8800FF',
                'strokeWidth': 4,
                'fillOpacity': 0.4,
                'strokeOpacity': 1.0
            }
        },
        filtPathCSS:function(){
            return {
                'fill': '#5ADDFF',
                'stroke': '#5ADDFF',
                'strokeWidth': 4,
                'fillOpacity': 0.4,
                'strokeOpacity': 1.0
            }
        },
        timePathCSS:function(){
            return {
                'stroke': '#fff',
                'strokeWidth': 8,
            }
        },
        timeMrkCSS:function(){
            return {
                'stroke': '#fff',
                'strokeWidth': 2,
            }
        },
        timeLineStr:function(){
            return `M0 ${this.svgD().h} L ${this.svgD().w} ${this.svgD().h}`
        },
        timeMrkStr:function(){
            let pos = (this.DataBc.index/this.DataBc.height)*this.svgD().w
            return `M${pos} 0 L ${pos} ${this.svgD().h}`
        },
        timeTxt:function(){
            return (this.DataBc.index/this.DataBc.height)*this.svgD().w + 10
        },
        pathStr:function() {
            let values = this.createBins()
            return this.pathD( values, this.lineCmd )
        },
        filtPathStr:function() {
            let values = this.createBins(true)
            return this.pathD( values, this.lineCmd )
        },
        isFiltering:function(){
            return (this.valid || this.searchFilter || this.tags.length>0)
        }
    },
    methods:{
        tagCSS:function(tag){
            let clr = (this.tags.indexOf(tag)>=0) ?
                {b:'rgb(90, 221, 255)',c:'rgb(0, 0, 0)'} :
                {b:'rgb(50, 50, 50)',c:'rgb(255, 255, 255)'}
            return {
                'display': 'inline-block',
                'background': clr.b,
                'color': clr.c,
                'padding': '6px 16px',
                'cursor': 'pointer',
                'margin':'0px 9px 9px 0px'
            }
        },
        marqueeOuterCSS:function(){
            let width = 0
            if(this.$el && this.$el.children){
                let p = 10 // nodeNfoCSS total padding
                let els = this.$el.children[0].children
                let lastDiv = els[els.length-1]
                let txtDiv = lastDiv.children[0]
                width = innerWidth - p - txtDiv.offsetWidth
            }
            return {
                'width': width+'px',
                'whiteSpace': 'nowrap',
                'overflow': 'hidden',
                'boxSizing': 'border-box',
            }
        },
        marqueeInnerCSS:function(){
            let ms = 1000
            if(this.$el && this.$el.children){
                let p = 10 // nodeNfoCSS total padding
                let els = this.$el.children[0].children
                let lastDiv = els[els.length-1]
                let addrDiv = lastDiv.children[1]
                let span = addrDiv.children[0]
                let width = span.offsetWidth
                ms = width * 10
            }
            return {
                'display': 'inline-block',
                'paddingLeft': '100%',
                'animation': `marquee ${ms}ms linear infinite`
            }
        },
        updatePeers:function(addrs){
            addrs.forEach((addr)=>{
                let a = addr.split(':')
                let ip = a[0]
                let port = a[1]
                if( !this.peers.hasOwnProperty(ip) ){
                    this.$set(this.peers,ip,{ip,port})
                    fetch(`http://api.ipstack.com/${a[0]}?access_key=${IPSTACK_KEY}`)
                    .then(res => res.json())
                    .then(d => {
                        // console.log(d)
                        this.$set(this.peers,ip,Object.assign(this.peers[d.ip],d))
                    }).catch(err=>{ console.error(err) })
                }
            })
        },
        countPeers:function(){
            if( Object.keys(this.peers).length > 0 ){
                return Object.keys(this.peers).length
            } else {
                return '?'
            }
        },
        displayPeers:function(){
            if( Object.keys(this.peers).length > 0 ){
                return Object.keys(this.peers).map((ip)=>{
                    let p = this.peers[ip]
                    let loc = ''
                    if( p.city && p.country_code=="US"){
                        loc = `(${p.city}, ${p.region_name} USA)`
                    } else if(p.city){
                        loc = `(${p.city}, ${p.country_name})`
                    }
                    return `${p.ip} ${loc}`
                }).join(' | ')
            } else {
                return '...'
            }
        },
        switchTagsDisplayed:function(){
            if(this.tagsDisplayed=="theme"){
                this.tagsDisplayed = "lang"
            } else {
                this.tagsDisplayed = "theme"
            }
        },
        switchBackToMain(){
            this.viewing = 'main'
            let filter = { search:this.searchFilter, tags:this.tags }
            this.DataBc.updateFilteredIndexes(filter,()=>{
                // console.log(this.DataBc.filteredIndexes)
            })
        },
        inputSearch:function(e){
            this.searchValue = e.target.value
            this.searchColor = '#fff'
        },
        updateSearch:function(){
            this.searchFilter = (this.searchValue=="") ? null : this.searchValue
            let filter = { search:this.searchFilter, tags:this.tags }
            this.DataBc.updateFilteredIndexes(filter,()=>{
                this.searchColor = '#5ADDFF'
                // console.log(this.DataBc.filteredIndexes)
            })
        },
        selectTag:function(e){
            let tag = e.target.textContent
                tag = tag.replace(/\n/g, "")
                tag = tag.replace(/ /g, "")
            if( e.target.style.backgroundColor == "rgb(50, 50, 50)"){
                e.target.style.backgroundColor = "rgb(90, 221, 255)"
                e.target.style.color = "rgb(0, 0, 0)"
                this.tags.push(tag)
            } else {
                e.target.style.backgroundColor = "rgb(50, 50, 50)"
                e.target.style.color = "rgb(255, 255, 255)"
                this.tags.splice(this.tags.indexOf(tag),1)
            }
        },
        tagTypeMessage:function(){
            if(this.tagsDisplayed=="theme"){
                return 'show language tags'
            } else {
                return 'show thematic tags'
            }
        },
        toggleValid:function(){
            this.valid = !this.valid
            this.DataBc.validOnly = this.valid
        },
        validToggleMessage:function(){
            if(this.valid){
                return 'filtering out blocks with no messages'
            } else {
                return 'showing all UTF8 data in blockchain'
            }
        },

        after:function(times,func){
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments)
                }
            }
        },
        timelineJump:function(blockSpot){
            let block, messages
            let blockchain = this.DataBc
            let filters = {
                valid:blockchain.validOnly,
                searchTerm:gui.$refs.cntrl.searchFilter,
                tags:gui.$refs.cntrl.tags
            }

            gui.$refs.leftArrow.opacity="0.5"
            gui.$refs.rightArrow.opacity="0.5"
            gui.$refs.nfo.hide()
            gui.$refs.tx.hide()

            const showData = this.after(4,()=>{
                gui.$refs.leftArrow.opacity="1"
                gui.$refs.rightArrow.opacity="1"
                gui.$refs.nfo.show(block)
                gui.$refs.tx.show(block,messages,filters)
            })

            blockchain.seekTo( blockSpot,(target)=>{
                new TWEEN.Tween(blockchain)
                    .to({ index:target }, 250)
                    .easing(TWEEN.Easing.Sinusoidal.Out)
                    .onComplete(()=>{

                        showData()

                        blockchain.getCurrentBlockInfo((data)=>{
                            block=data
                            showData()
                        })

                        blockchain.getCurrentBlockMessages((data)=>{
                            messages=data
                            showData()
                        })

                    })
                    .start()
            })

            setTimeout(showData,blockchain.speed+100)
        },
        clickTL:function(e){
            if(this.bookmarkJump) return;
            let blockSpot = e.layerX / this.svgD().w
            this.timelineJump( blockSpot )
        },
        jumpToBookmark:function(b){
            this.bookmarkJump = true
            let spot = b / this.DataBc.height
            this.timelineJump(spot)
            setTimeout(()=>{ this.bookmarkJump=false },100)
        },

        createFilteredValues:function(){
            let b = this.DataBc
            let f = b.filtering
            let v = b.validOnly
            let a = []
            if( f ){
                a = b.filteredIndexes
                if(v) a=a.filter(i=>b.messageIdxsMap.valid.hasOwnProperty(i))
            } else if( v ){
                a = b.messageIndexes.valid
            }
            return a
        },
        tlCurIdx:function(){
            return this.tl.arr.indexOf(this.DataBc.index)+1
        },
        createBins:function(filter){
            let xCount = 0
            let yTally = 0
            let binSze = this.DataBc.height / this.tl.bins
            let values = []
            let arr = (filter) ?
                this.createFilteredValues() : this.DataBc.messageIndexes.all

            for(let i = 0; i < this.tl.bins; i++) values.push([i,0])
            arr.forEach(v=>{
                let binIdx = this.map(v,0,this.DataBc.height,0,this.tl.bins-1)
                    binIdx = Math.round(binIdx)
                values[binIdx][1]++
                // if(filter)console.log(binIdx,v)
            })
            this.tl.arr = arr

            // reduce to scale
            let nudge = 10
            let maxX = Math.max(...values.map(p=>p[0]))
            let maxY = Math.max(...values.map(p=>p[1]))
            values = values.map((p)=>{
                let x = this.map(p[0],0,maxX,0,this.svgD().w)
                let y = this.map(p[1],0,maxY,0,this.svgD().h-nudge)
                    y = this.svgD().h - y - nudge// flip && nudge up
                return [Math.round(x),Math.round(y)]
            })
            // add header/footer points to fill out shape
            values.unshift([0,this.svgD().h])
            values.push([this.svgD().w,this.svgD().h])
            values.push([0,this.svgD().h])
            return values
        },
        svgD:function(){
            // padding - (btnsCSS.width + btnsCSS.right)
            let w = innerWidth-(18*2)-(401+18)
            let h = 161 // btnsCSS.height
            return { w:w, h:h }
        },
        map:function(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
        },
        // these next few functions via:
        // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
        lineVec:function(p1,p2){
            lengthX = p2[0] - p1[0]
            lengthY = p2[1] - p1[1]
            return {
                length: Math.sqrt(Math.pow(lengthX,2)+Math.pow(lengthY,2)),
                angle: Math.atan2(lengthY,lengthX)
            }
        },
        cntrlPnt:function(cur,prev,nxt,rev){
            let p = prev || cur
            let n = nxt || cur
            let smoothing = 0.2
            let o = this.lineVec(p,n)
            let angle = o.angle + (rev ? Math.PI : 0)
            let length = o.length * smoothing
            let x = cur[0] + Math.cos(angle) * length
            let y = cur[1] + Math.sin(angle) * length
            return [x,y]
        },
        lineCmd:function(p){
            return `L ${p[0]} ${p[1]}`
        },
        pathD:function(points,command){
            let d = points.reduce((acc,pt,i,a)=>{
                return `${acc} ${command(pt,i,a)}`
            })
            return `M ${d}`
        }
    },
    template:`<div>
        <section :style="secCSS">

            <section :style="mainSecCSS">
                <div :style="btnsCSS">
                    <div>
                        <input type="text" placeholder="search term"
                               :style="inputCSS"
                               @input="inputSearch($event)">
                        <button :style="searchBtnCSS" @click="updateSearch()">
                            filter</button>
                    </div>
                    <div>
                        <span :style="bCSS" @click="viewing='tags'">
                            filtering messages by {{tags.length}}
                            tag<span v-if="tags.length!==1">s</span>
                             &gt;&gt;
                        </span>
                    </div>
                    <div @click="toggleValid()">
                        <span :style="bCSS">{{ validToggleMessage() }}</span>
                    </div>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" @click="clickTL($event)"
                     :view-box="viewbox" :style="svgCSS">
                    <g>
                        <path :style="pathCSS" :d="pathStr"></path>
                        <path :style="filtPathCSS" :d="filtPathStr"></path>
                        <path :style="timeMrkCSS" :d="timeMrkStr"></path>
                        <path :style="timePathCSS" :d="timeLineStr"></path>
                    </g>
                    <g v-if="!isFiltering">
                        <circle fill="#5ADDFF" v-for="b in bookmarks" :key="b.index"
                            @click="jumpToBookmark(b.index)"
                            :cx="b.x" :cy="b.y" :r="b.r"/>
                    </g>
                    <text :x="timeTxt" y="10" v-if="isFiltering"
                        font-family="monospace" font-size="14" fill="#fff">
                        {{tlCurIdx()}}/{{tl.arr.length}}
                    </text>
                    <text v-for="(y,i) in years"
                          :x="(svgD().w/9.33333)*i" :y="svgD().h-8"
                          font-family="monospace" font-size="14" fill="#fff">
                        |{{y}}
                    </text>
                </svg>
            </section>

            <section :style="tagSecCSS">
                <div :style="tagsCntrlCSS">
                    <div :style="bCSS" @click="switchBackToMain()">
                        &lt;&lt; back to timeline </div>
                    <div :style="bCSS" @click="switchTagsDisplayed()">
                        {{ tagTypeMessage() }} </div>
                </div>
                <div>
                    <div v-if="tagsDisplayed=='theme'" >
                        <div v-for="t in themeTags" :style="tagCSS(t)"
                             :key="t" @click="selectTag($event)">
                            {{t}}
                        </div>
                    </div>
                    <div v-else="tagsDisplayed=='lang'">
                        <div v-for="l in langTags" :style="tagCSS(l)"
                             :key="l" @click="selectTag($event)">
                            {{l}}
                        </div>
                    </div>
                </div>
            </section>

            <div :style="nodeNfoCSS">
                <div>
                    This computer is a bitcoin node; it's relayed
                    {{mempool}} transaction<span v-if="mempool!=1">s</span>
                    and connected to {{countPeers()}} peers:&nbsp;
                </div>
                <div :style="marqueeOuterCSS()">
                    <span :style="marqueeInnerCSS()">{{displayPeers()}}</span>
                </div>
            </div>

        </section>
    </div>`
})
