class Blockchain {
    constructor( config ){
        if( !config ) throw new Error('Blockchain expecting config object')
        if( !config.getAuthHeaders )
            throw new Error('Blockchain expecting getAuthHeaders function')

        this.scene = config.scene
        this.getAuthHeaders = config.getAuthHeaders
        this.height = config.height

        this.messageIndexes = config.messageIndexes
        this.messageIdxsMap = this.makeMsgIdxDict()
        // messageIndexes = {all:[], valid:[], sfw:[], bookmarked:[]}
        this.filteredIndexes = [] // if cntrl has filters set
        this.filtering = false // if cntrl has tags &&/or filter
        this.sfwOnly = config.sfw || false
        this.validOnly = false // if cntrl has valid filter on

        this.speed = config.speed || 500
        this.serverIP = config.ip || 'localhost:8989'
        this.renderTotal = 9

        this.shiftLock = false
        this.blocks = []
        this.index = 0
        // reference to gui.$refs.cntrl (cntlr component)
        this.cntrl = null
    }

    init(){
        for (let i = 0; i < this.renderTotal; i++) {

            let block = new Block({speed:this.speed})
                block.position.x = -1.5*i

            if(i>0) block.position.x -= 1.5
            else block.growCube()

            block.setPhase()
            this.blocks.push( block )
            this.scene.add( block.obj )
        }
    }

    makeMsgIdxDict(){
        let dict = {}
        for( let prop in this.messageIndexes ){
            dict[prop] = {}
            this.messageIndexes[prop].forEach(idx=>{
                dict[prop][idx] = null
            })
        }
        return dict
    }

    firstBlockXYZ(){
        return this.blocks[0].position
    }

    getCurrentBlockInfo(callback){
        fetch(
            `https://${this.serverIP}/api/block?index=${this.index}`,
            { headers: this.getAuthHeaders() })
        .then(res => res.json())
        .then(data => { callback(data) })
        .catch(err=>{ console.error(err) })
    }

    updateFilteredIndexes(filter, callback){
        // filter = {search:'string',tags:[Array]}
        this.filtering = (filter.search||(filter.tags.length>0)) ? true : false

        // create params to fetch filteredIndexes
        let params = ''
        if(filter.search){
            params = `?search=${filter.search}`
            filter.tags.forEach((t)=>{ params += `&tags[]=${t}` })
        } else {
            filter.tags.forEach((t,i)=>{
                if(i==0) params += `?tags[]=${t}`
                else params += `&tags[]=${t}`
            })
        }
        fetch(
            `https://${this.serverIP}/api/filter/blocklist${params}`,
            { headers: this.getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            this.filteredIndexes = data
            if(callback) callback(data)
        })
        .catch(err=>{ console.error(err) })
    }

    getCurrentBlockMessages(callback){
        // TODO make these variable ( github issue#2 )
        if( this.messageIndexes.all.indexOf(this.index) >=0 ){
            fetch(
                `https://${this.serverIP}/api/block/messages?index=${this.index}`,
                { headers: this.getAuthHeaders() })
                .then(res => res.json())
                .then(data => { callback(data) })
                .catch(err=>{ console.error(err) })
        } else {
            callback(null)
        }
    }

    _getClosestValues(a, x) {
        // via https://stackoverflow.com/a/4431347/1104148
        var lo = -1, hi = a.length;
        while (hi - lo > 1) {
            var mid = Math.round((lo + hi)/2);
            if (a[mid] <= x) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        if (a[lo] == x) hi = lo;
        return [a[lo], a[hi]];
    }

    _incLogix(dir){
        let f = this.filtering
        let v = this.validOnly
        let idx = this.index
        let arr = []

        if( f ){
            arr = this.filteredIndexes
            if(v) arr=arr.filter(i=>this.messageIdxsMap.valid.hasOwnProperty(i))
        } else if( v ){
            arr = this.messageIndexes.valid
        } else {
            // if no filters are set at all
            idx += dir
            return { index:idx, avert:false }
        }

        arr = arr.sort()
        let vals = this._getClosestValues(arr,idx+dir)
        idx = (dir>0) ? vals[1] : vals[0]

        if(typeof idx=="undefined"){
            return { index:this.index, avert:true }
        } else {
            return { index:idx, avert:false }
        }
    }

    _shift( dir, callback ){
        if( !this.shiftLock ){
            // only shift next if we're not already at the end
            // only shift back if we're not already at the beginning
            if( (dir > 0 && this.index !== this.height) ||
                (dir < 0 && this.index !== 0 ) ){
                    this.shiftLock = true
                    // this.index += dir
                    let nxt = this._incLogix(dir)
                    this.index = nxt.index
                    if( !nxt.avert ){
                        this.blocks.forEach(b=>b.update(dir))
                        setTimeout( callback, this.blocks[0].speed+100 )
                    } else {
                        setTimeout(()=>{
                            this.shiftLock = false
                        },this.blocks[0].speed+100 )
                    }
                }
        }
    }

    seekTo(x,callback){
        let idx = Math.floor(this.height*x)
        this.index = idx
        let obj = { idx:this.index }

        let f = this.filtering
        let v = this.validOnly
        if( !f && !v ){
            callback( idx )
        } else {
            let arr = []
            if( f ){
                arr = this.filteredIndexes
                if(v) arr=arr.filter(i=>
                                this.messageIdxsMap.valid.hasOwnProperty(i))
            } else if( v ){
                arr = this.messageIndexes.valid
            }
            arr = arr.sort()
            let vals = this._getClosestValues(arr,idx)
            if( typeof vals[0]=="undefined" ){
                callback( vals[1] )
            } else if( typeof vals[1]=="undefined" ){
                callback( vals[0] )
            } else {
                let dists = [Math.abs(idx-vals[0]),Math.abs(idx-vals[1])]
                if( dists[0] > dists[1] ){
                    callback( vals[1] )
                } else {
                    callback( vals[0] )
                }
            }
        }
    }

    shiftNext(){
        this._shift( +1,()=>{
            // if first block is off screen
            if( this.blocks[0].position.x > 7.5
                && this.index < this.height-3 ){
                // remove block from front of blockchain && from scene
                let oldBlock = this.blocks.shift()
                this.scene.remove( oldBlock.obj )
                // add block to blockchain && scene
                let newBlock = new Block({speed:this.speed})
                    newBlock.position.x = -7.5
                    newBlock.setPhase()
                this.blocks.push( newBlock )
                this.scene.add( newBlock.obj )
            }
            this.shiftLock = false
        })
    }

    shiftPrev(){
        this._shift( -1, ()=>{
            // if last block is off screen
            if( this.blocks[this.blocks.length-1].position.x < -7.5
                && this.index > 3 ){
                // remove block from back of blockchain && from scene
                let oldBlock = this.blocks.pop()
                this.scene.remove( oldBlock.obj )
                // add block to blockchain && scene
                let newBlock = new Block({speed:this.speed})
                    newBlock.position.x = 7.5
                    newBlock.setPhase()
                this.blocks.unshift( newBlock )
                this.scene.add( newBlock.obj )
            }
            this.shiftLock = false
        })
    }


}
