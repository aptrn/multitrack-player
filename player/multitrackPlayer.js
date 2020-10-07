const template = document.createElement('template');
template.innerHTML = 
`
<div class="whole">
    <link href="/player/style.css" rel="stylesheet" type="text/css">  
    <div id="player">
        <div id="main">
            <div id="transport">
                <button id="play"><img src="/player/assets/play_scaled.png"/></button>
                <button id="stop"><img src="/player/assets/stop_scaled.png"/></button>  
                
                <input id="loop" type="checkbox">loop</input>
            </div>
            <div id="mutes">
            </div>

            <div id="volumeDiv">
                <h2>out volume</h2><p id="volume-value">0 gain</p>
                <input id="volumeSlider" type="range" min="0" max="1" value="1" step="0.0001">
            </div>
        </div>
        <div id="parameters">

   
            <button class="tablinks" id="filter">filter</button>
            <button class="tablinks" id="equalizer">equalizer</button>
            <button class="tablinks" id="compressor">compressor</button>

            <div class="tabcontent" id="filterDiv">
                <p>lp</p><p id="lp-value">20000Hz</p>
                <input id="lp" type="range" min="20" max="20000" value="19999" step="1">
                <p>hp</p><p id="hp-value">20Hz</p>
                <input id="hp" type="range" min="20" max="20000" value="20" step="1">
            </div>
            <div class="tabcontent" id="equalizerDiv">
                <div id="equalizerDiv">
                </div>
            </div>
            <div class="tabcontent" id="compressorDiv">
                <p>threshold</p><p id="threshold-value">0dB</p>
                <input id="threshold" type="range" min="-90" max="0" value="0" step="0.01">
                <p>ratio</p> <p id="ratio-value">1 : 1</p>
                <input id="ratio" type="range" min="1" max="48" value="1" step="0.01">
                <p>attack</p><p id="attack-value">10ms</p>
                <input id="attack" type="range" min="0" max="50" value="10" step="0.01">
                <p>release</p><p id="release-value">10ms</p>
                <input id="release" type="range" min="0" max="50" value="10" step="0.01">
            </div>
        </div>
        <div id="wave">
        </div>
    </div>
</div>
`

var eqFreq = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

 



class multitrackPlayer extends HTMLElement{

    
    constructor(){
        super();
        this._authorized = this.getAttribute('auth');
        console.log("Auth: " + this._authorized);

        //Add template
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadow = this.shadowRoot;
        
        //Close all param tabs
        var tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
        for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }


        //DRAW Context
        this.context = new Array(2);
        this.id = this.getAttribute('id');
        this.canvasWidth = this.shadowRoot.querySelector('.whole').offsetWidth * 3 / 5;
        this.canvasHeight = this.shadowRoot.querySelector('.whole').offsetWidth / 3;
        

        //AUDIO Context
        var AudioContext = window.AudioContext || window.webkitAudioContext || false;
        if (AudioContext){
            this.audioContext = new AudioContext();
        }
        else{
            alert("Sorry, your browser doesn't support function needed for this player");
        }
        this.audioContext.destination.channelCountMode = "clamped-max";
        this.audioContext.destination.channelInterpretation = "explicit";
        this.source = null;
        this.loop = false;
        this.currentBuffer = null;
        this.startPoint = 0;
        this.endPoint = 1;
        var self = this;
        this.startPosition = 0;
        this.endPosition = this.canvasWidth;
        this.point1 = 0;
        this.point2 = this.canvasWidth;
        //TIMING STUFF
        this.remaining = 0;
        this.lastTime = 0;
        this.waiting = false;
        this.batchTime = this.audioContext.baseLatency || (128 / this.audioContext.sampleRate);

 
        //Equalizer
        this.createAudioNodes();
        
        //Carica audio dall'attributo "file"
        var layout = this.getAttribute('layout');
        this.configuration = layout.split('');
        console.log(this.configuration);
        multitrackPlayer.loadAudio(this.getAttribute('file'))
        .then(function(e){ self.loaded(e), function(e){ console.log("mhmmm")}});
    }

    connectedCallback(){
    }

    disconnectCallback(){
        this.source = null;
        this.audioContext = null;
        this.context = null;
    }
    
    displayFileInfo(){
        var main = this.shadow.getElementById("main");
        var infos = document.createElement("h3");
        infos.innerHTML = "Title: " + this.getAttribute('filename') + " Lenght: " + this.currentBuffer.duration + "s";
        main.prepend(infos);
    }

    updateChannels(){
        this.source.channelCount = this.audioContext.destination.channelCount;
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.compressor = new Array(this.audioContext.destination.channelCount);
        for(var i = 0; i < this.audioContext.destination.channelCount; i++){
            this.compressor[i] = this.audioContext.createDynamicsCompressor();
            this.compressor[i].channelCountMode = "explicit";
            this.compressor[i].channelCount = 1;
        }
    }

    createAudioNodes(){
        this.createEq();
        this.gain = this.audioContext.createGain();
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp = this.audioContext.createBiquadFilter();
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.lp.type = "lowpass";
        this.lp.frequency.setValueAtTime(20000, this.audioContext.currentTime);
        this.hp = this.audioContext.createBiquadFilter();
        this.hp.type = "highpass";
        this.hp.frequency.setValueAtTime(20, this.audioContext.currentTime);

        this.compressor = new Array(this.audioContext.destination.channelCount);
        for(var i = 0; i < this.audioContext.destination.channelCount; i++){
            this.compressor[i] = this.audioContext.createDynamicsCompressor();
            this.compressor[i].channelCountMode = "explicit";
            this.compressor[i].channelCount = 1;
        }
    };

    // Load Audio buffer and fill this.source   
     static async loadAudio(url) {   
        var self = this;
        return new Promise(function (resolve, reject){
            var req = new XMLHttpRequest();
            req.open( "GET", url, true );
            req.responseType = "arraybuffer";   
            req.onreadystatechange = function (e) {
                if (req.readyState == 4) {
                    if(req.status == 200){
                        //console.log(url + " " + self.id)
                        
                        resolve(req);
                }}};
            req.onerror = reject; 
            req.send();
        });
    }

    loaded(req) {
        var self = this;
            this.audioContext.decodeAudioData(req.response, 
            function (buffer){
                //console.log("load: " + self.id);
                self.audioContext.destination.channelCount = Math.min(self.audioContext.destination.maxChannelCount, buffer.numberOfChannels);
                self.source = self.audioContext.createBufferSource();
                self.source.channelCount = self.audioContext.destination.channelCount;
                self.currentBuffer = buffer;
                self.source.buffer = buffer;
                self.updateChannels();
                self.displayAndConnect();
            }, self.onDecodeError);
    };

    displayAndConnect(){
        //var self = this;
        //Canvas
        this.createCanvas(0, this.canvasWidth, this.canvasHeight); //waveform
        this.createCanvas(1, this.canvasWidth, this.canvasHeight); //playehead
    
        this.activeBufferDuration = this.currentBuffer.duration;
        this.source.loopStart = 0;
        this.source.loopEnd = this.currentBuffer.duration;

        this.displayFileInfo();
        this.createMutes(this.source.buffer);
        multitrackPlayer.displayBuffer(this, this.analyzeData(this.source.buffer));
        this.lp.connect(this.hp);
        this.hp.connect(this.eq[0]);
        for(var i = 0; i < this.eq.length; i++){
            if(i == this.eq.length - 1){
                if(this.audioContext.destination.channelCount > 2){
                    console.log("total compressor number: " + this.compressor.length);
                    this.splitComp = this.audioContext.createChannelSplitter(this.source.buffer.numberOfChannels);
                    this.mergeComp = this.audioContext.createChannelMerger(this.audioContext.destination.channelCount);
                    this.eq[i].connect(this.splitComp);
                    for(var c = 0; c < this.compressor.length; c++){
                        this.splitComp.connect(this.compressor[c], c, 0);
                        this.compressor[c].connect(this.mergeComp, 0, c);
                    }
                    this.mergeComp.connect(this.gain);
                }
                else{
                    //this.splitComp = this.audioContext.createChannelSplitter(this.source.buffer.numberOfChannels);
                    this.compressor[0].channelCount = 2;
                    this.eq[i].connect(this.compressor[0]);
                    this.compressor[0].connect(this.gain);
                    //this.mergeComp = this.audioContext.createChannelMerger(this.source.buffer.numberOfChannels);
                    //this.splitComp.connect(this.mergeComp, c, 0);
                }
            }
            else this.eq[i].connect(this.eq[i + 1]);
        }
        
        if(this._authorized === 'true'){
            //this.outSplitter = this.audioContext.createChannelSplitter(this.configuration.length);
            //this.outMerger = this.audioContext.createChannelMerger(this.configuration.length);
            this.gain.connect(this.audioContext.destination);

            /*
            console.log("Canali totali da connettere: " + this.configuration.length);

            for(var c = 0; c < this.configuration.length; c++){
                console.log("connecting ch: " + c + " to " + this.configuration[c]);

                console.log(c % this.audioContext.destination.channelCount);

                if(this.configuration[c] === 'L') this.outSplitter.connect(this.outMerger, c, 0 % this.audioContext.destination.channelCount);
                else if(this.configuration[c] === 'R') this.outSplitter.connect(this.outMerger, c, 1 % this.audioContext.destination.channelCount);
                else if(this.configuration[c] === 'B') this.outSplitter.connect(this.outMerger, c, 2 % this.audioContext.destination.channelCount);
                else if(this.configuration[c] === 'D') this.outSplitter.connect(this.outMerger, c, 3 % this.audioContext.destination.channelCount);
                else if(this.configuration[c] === 'C'){
                    this.outSplitter.connect(this.outMerger, c, 0 % this.audioContext.destination.channelCount);
                    this.outSplitter.connect(this.outMerger, c, 1 % this.audioContext.destination.channelCount);
                }
            }
            */
          // this.outSplitter.connect(this.outMerger);
          //  this.outMerger.connect(this.audioContext.destination);
        } 
        else{
            this.monoMerge = this.audioContext.createChannelMerger(1);
            this.gain.connect(this.monoMerge);
            this.monoMerge.connect(this.audioContext.destination, 0, 0);
        }
        console.log("Detected active channels: " + this.audioContext.destination.channelCount + " / " + this.audioContext.destination.maxChannelCount);
        console.log("buffer: " + this.source.buffer.numberOfChannels);
        console.log("source: " + this.source.channelCount);
        console.log("muteSplitter: " + this.muteSplitter.channelCount);
        console.log("mutes: " + this.mutes[0].channelCount);
        console.log("merger: " + this.routesMerger.channelCount);
        console.log("lp: " + this.lp.channelCount);
        console.log("eq: " + this.eq[0].channelCount);
        console.log("compressor: " + this.compressor[0].channelCount);
        //console.log("compressor: " + this.compressor[1].channelCount);
        console.log("gain: " + this.gain.channelCount);
        console.log("destination: " + this.audioContext.destination.channelCount);
        
        //Aggiungi callback della ui
        this.addCallbacks();
    }
        
    
    onDecodeError() {  alert('error while decoding your file.');  }

    recreateBuffer(){
        var self = this;
        self.source = self.audioContext.createBufferSource();
        self.source.buffer = self.currentBuffer;
        self.source.loop = self.loop;
        self.source.loopStart = self.calculateTime(self.startPoint);
        self.source.loopEnd = self.calculateTime(self.endPoint);
        self.source.connect(self.muteSplitter);
    }

    createMutes(buffer){
        var self = this;
        self.muteSplitter = self.audioContext.createChannelSplitter(buffer.numberOfChannels);
        self.muteMerger = self.audioContext.createChannelMerger(buffer.numberOfChannels);
        self.source.connect(self.muteSplitter);
        
        self.mutes = new Array(buffer.numberOfChannels);
        self.elementMutes = self.shadow.getElementById('mutes');
        for(var i = 0; i < buffer.numberOfChannels; i++){
            self.mutes[i] = self.audioContext.createGain();
            self.mutes[i].channelCount = 1;
            self.mutes[i].gain.setValueAtTime(1, self.audioContext.currentTime);
            self.muteSplitter.connect(self.mutes[i], i);
            self.mutes[i].connect(self.muteMerger, 0, i);
            var nMute = document.createElement("input");
            nMute.innerText = self.configuration[i];
            nMute.number = i;
            nMute.type = "checkbox";
            self.elementMutes.appendChild(nMute);
            nMute.addEventListener('click', function(){
                //console.log("mute " + this.number + " = " + this.checked); 
                self.mutes[this.number].gain.setValueAtTime(this.checked ? 0 : 1, self.audioContext.currentTime);
            });
        }
        self.routeSplitter = self.audioContext.createChannelSplitter(buffer.numberOfChannels);
        self.routesMerger = self.audioContext.createChannelMerger(buffer.numberOfChannels);
        self.muteMerger.connect(self.routeSplitter);
        self.routes = new Array(buffer.numberOfChannels);
        for(var i = 0; i < buffer.numberOfChannels; i++){
            self.routes[i] = self.audioContext.createGain();
            self.routes[i].channelCount = 1;
            self.routes[i].gain.setValueAtTime(1, self.audioContext.currentTime);
        }
        for(var i = 0; i < buffer.numberOfChannels; i++){
            console.log("connecting ch: " + i + " to " + self.configuration[i]);
            if(self.configuration[i] === 'L') self.routeSplitter.connect(self.routes[0], i);
            else if(self.configuration[i] === 'R') self.routeSplitter.connect(self.routes[1], i);
            else if(self.configuration[i] === 'B') self.routeSplitter.connect(self.routes[2], i);
            else if(self.configuration[i] === 'D') self.routeSplitter.connect(self.routes[3], i);
            else if(self.configuration[i] === 'C'){
                self.muteSplitter.connect(self.routes[0], i);
                //self.muteSplitter.connect(self.routes[1], i);
            }
            else if(self.configuration[i] === 'S'){
                //subwoofer?
            }                       
            self.routes[i].connect(self.routesMerger, 0, i);
        }
        self.routesMerger.connect(self.lp);
    }

    createEq(){
        var self = this;
        this.eq = new Array(10);
        for(var i = 0; i < this.eq.length; i++){
            this.eq[i] = this.audioContext.createBiquadFilter();
            this.eq[i].channelCount = this.audioContext.destination.channelCount;
            this.eq[i].type = "peaking";
            this.eq[i].frequency.setValueAtTime(eqFreq[i], this.audioContext.currentTime);
        }
        var elementEq = this.shadow.getElementById('equalizerDiv');
        for(var i = 0; i < this.eq.length; i++){
            var label = document.createElement("p");
            label.id = "eq_label_" + i;
            label.innerHTML = eqFreq[i] + "Hz";
            elementEq.appendChild(label);
            var nEq = document.createElement("input");
            nEq.number = i;
            nEq.id = "eq_" + i;
            nEq.type = "range";
            nEq.orient = "vertical";
            nEq.min = -10;
            nEq.max = 10;
            nEq.value = 0;
            nEq.step = 0.001;
            elementEq.appendChild(nEq);
            nEq.addEventListener('change', function() {
                self.eq[this.number].gain.setValueAtTime(this.value, self.audioContext.currentTime);
            });
        }
    }

    createCanvas (number,  w, h ) {
        var newCanvas = document.createElement('canvas');
        newCanvas.id = "waveform_" + number;
        newCanvas.width  = w;
        newCanvas.height = h;
        var wave = this.shadow.getElementById('wave');
        wave.appendChild(newCanvas);
        this.context[number] = newCanvas.getContext('2d');
    }
    
    analyzeData(buff) {
        //da capire, ridurre i samples per visualizzare meglio
        //var downSampled = buff;
        return buff;
    }

    // Clear canvas and draw every channel of the buffer
    static displayBuffer(obj, buff) {   
        var self = obj;
        //console.log("display: " + self.id);
        self.context[0].save();
        self.context[0].fillStyle = '#666';
        self.context[0].fillRect(0, 0, self.canvasWidth, self.canvasHeight);
        self.context[0].strokeStyle = '#fff';

    
        for(var c = 0; c < buff.numberOfChannels; c++){
            self.context[0].translate(0, (self.canvasHeight / buff.numberOfChannels) / 2);
            self.context[0].beginPath();
            var thisChannel = buff.getChannelData(c);
            for(var x = 0; x < self.canvasWidth; x++){
                var s = multitrackPlayer.map_range(x, 0, self.canvasWidth, 0, thisChannel.length);
                var y = multitrackPlayer.map_range(thisChannel[parseInt(s)], 0, 1, 1, self.canvasHeight / buff.numberOfChannels);
                self.context[0].moveTo( x, 0 );
                self.context[0].lineTo( x, y );
                self.context[0].stroke();
            }
            self.context[0].translate(0,(self.canvasHeight / buff.numberOfChannels) / 2);
        }
        self.context[0].restore();
        console.log('done');

        
        window.requestAnimationFrame(multitrackPlayer.drawPlayhead.bind(self));
    }

    //Map value function
    static map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    //Map values (0. to 1.) to (0. to buffer length in seconds)
    calculateTime(x){
        var mapSeconds = multitrackPlayer.map_range(x, 0, 1, 0, this.currentBuffer.duration);
        return mapSeconds;
    }


    static drawPlayhead() {
       

        this.activeBufferDuration = this.source.loopEnd - this.source.loopStart;
        this.now = this.audioContext.currentTime;


        this.startPosition = multitrackPlayer.map_range(this.startPoint, 0, 1, 1, this.canvasWidth -1);
        this.endPosition = multitrackPlayer.map_range(this.endPoint, 0, 1, 1, this.canvasWidth -1);

        this.context[1].clearRect(0,0, this.canvasWidth, this.canvasHeight);
        this.context[1].save();

        //LABEL INIZIO E FINE
        this.context[1].font = "20px Comic Sans MS";
        this.context[1].fillStyle = 'rgba(0, 0, 0, 1)';
        this.context[1].textAlign = "left";
        this.context[1].fillText("0:00", 0, 20);
        this.context[1].textAlign = "right";
        this.context[1].fillText(Number(this.currentBuffer.duration / 60).toFixed(2).replace(/\./g, ":"), this.canvasWidth, 20);

        if(!this.clicking){
            this.context[1].strokeStyle = '#222';
            //START
            this.context[1].beginPath();
            this.context[1].moveTo(this.startPosition, 0);
            this.context[1].lineTo(this.startPosition, this.canvasHeight);
            this.context[1].stroke();
            this.context[1].strokeStyle = '#222';

            //END
            this.context[1].beginPath();
            this.context[1].moveTo(this.endPosition, 0);
            this.context[1].lineTo(this.endPosition, this.canvasHeight);
            this.context[1].stroke();

            this.context[1].fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.context[1].beginPath();
            this.context[1].rect(this.startPosition, 0, this.endPosition - this.startPosition, this.canvasHeight)
            this.context[1].fill();

            //START/END LABEL
            this.context[1].textAlign = "left";
            this.context[1].fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.context[1].fillText(Number(this.source.loopStart / 60).toFixed(2).replace(/\./g, ":"), this.startPosition, 20);
            this.context[1].textAlign = "right";
            this.context[1].fillText(Number(this.source.loopEnd / 60).toFixed(2).replace(/\./g, ":"), this.endPosition, 20); 
        }

        //PLAYHEAD

        if(!this.clicking){
           // console.log(this.isPlaying);
                   
            if(this.isPlaying){
                if(this.now - this.lastTime >= this.activeBufferDuration ){
                    this.lastTime = this.now - (this.now - (this.lastTime + this.activeBufferDuration)); //lastTime = timer all'ultimo start
                }
                this.elapsed = ((this.now - this.lastTime) % this.activeBufferDuration);
            }
            else{

                this.lastTime = this.now;
            }

            var position = multitrackPlayer.map_range(this.elapsed + this.source.loopStart, 0, this.currentBuffer.duration, 0, this.canvasWidth);

            this.context[1].strokeStyle = '#f22';
            this.context[1].beginPath();
            this.context[1].moveTo(position, 0);
            this.context[1].lineTo(position, this.canvasHeight);
            this.context[1].stroke();
        }

        
        //console.log("lastTime: " + this.lastTime);
        
        this.context[1].restore();
        window.requestAnimationFrame(multitrackPlayer.drawPlayhead.bind(this));
    };

    restartAt(newValue, forceStart){
        //console.log("restarting")
        var self = this;
        if(self.isPlaying) {
            self.stop();
            self.keep = true;
        }
        else self.keep = false;

        var value = self.calculateTime(newValue);
        if(self.keep || forceStart){
            self.elapsed = value;
            self.lastTime = self.audioContext.currentTime + self.source.loopStart - self.elapsed;
            self.mettiPlay(newValue);
            self.keep = false;
        }
        else{

            self.elapsed = value - self.source.loopStart;
            self.lastTime = self.audioContext.currentTime + self.source.loopStart - self.elapsed;

        }
    }

    updateBounds(newStart, newEnd){
        var self = this;
        //console.log("updateBounds - isPlaying: " + self.isPlaying);
        if(self.isPlaying) {
            self.keep = true;
            self.stop();
        }
        else{ self.keep = false; }
        self = this;
        self.startPoint = newStart;
        self.source.loopStart = self.calculateTime(self.startPoint);

        self.endPoint = newEnd;
        self.source.loopEnd = self.calculateTime(self.endPoint);
        
        if(self.keep){
            self.keep = false;
            self.lastTime = self.audioContext.currentTime;
            self.mettiPlay(self.startPoint);
        }
    }

    mettiPlay(playPos){

        var self = this;
        //console.log("metto play");

        
        self.isPlaying = true;
        self.source.start(self.audioContext.currentTime, self.calculateTime(playPos), self.calculateTime(self.endPoint) - self.calculateTime(playPos));
        self.source.addEventListener('ended', () => {
            if(!self.loop){
                self.stop();
                
            }
            else{
                //console.log("qui????");
                //&& (!!window.chrome.webstore || !!window.chrome.runtime)
                var isChrome = window.chrome;
                if(isChrome && self.isPlaying && !self.clicking) {
                    //console.log("should restart!");
                    self.restartAt(self.startPoint, false);
                    //console.log("startpoint: " + self.startPoint + " endpoint: " + self.endPoint);
                }
                else if (isChrome && self.restartChrome){
                    //console.log("restart chrome!");
                    self.restartAt(self.restartPoint, true);
                    self.restartPoint = self.loopStart;
                    self.restartChrome = false;
                }
                else if (self.isChrome && self.clicking){
                    self.stop();
                }
                //self.isPlaying = false;
            }
        });
    }

    stop(){
        var self = this;
        //console.log("stopping");
        self.isPlaying = false; 
        self.source.stop(this.audioContext.currentTime);
        self.recreateBuffer();
    }

    openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        var switcher = this.shadow.getElementById(tabName+'Div').style.display == "block" ? true : false;
        tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = this.shadowRoot.querySelectorAll(".tablinks");
        for (i = 0; i < tablinks.length; i++) {
            //tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
       
        if(switcher) this.shadow.getElementById(tabName+'Div').style.display = "none"
        else this.shadow.getElementById(tabName+'Div').style.display = "block";
        //evt.currentTarget.className += " active";
    }

    //Callbacks for buttons
    addCallbacks(){
        var self = this;

        this.shadowRoot.getElementById('filter').addEventListener('click', function(e){
            self.openTab(e, this.id);
        });
        this.shadowRoot.getElementById('equalizer').addEventListener('click', function(e){
            self.openTab(e, this.id);
        });
        this.shadowRoot.getElementById('compressor').addEventListener('click', function(e){
            self.openTab(e, this.id);
        });

        this.shadowRoot.getElementById('play').addEventListener('click', function(){
            self.lastTime = self.audioContext.currentTime;
            self.mettiPlay(self.startPoint);
        });

        this.shadowRoot.getElementById('stop').addEventListener('click', function(){
           self.stop();
        });

        this.shadowRoot.getElementById('loop').addEventListener('click', function() {
            self.loop = this.checked;
            self.source.loop = self.loop;
        });

        /*
        this.shadowRoot.getElementById('start').addEventListener('change', function() {
            self.updateBounds(this.value, self.endPoint);
            var label = self.shadow.getElementById("start-value");
            label.innerHTML = self.source.loopStart + " sec";
        });
        this.shadowRoot.getElementById('end').addEventListener('change', function() {
            self.updateBounds(self.startPoint, this.value);
            var label = self.shadow.getElementById("end-value");
            label.innerHTML = self.source.loopEnd + " sec";
        });
        */
        this.shadowRoot.getElementById('volumeSlider').addEventListener('change', function() {
            self.gain.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("volume-value");
            label.innerHTML = this.value + "gain";
        });
        this.shadowRoot.getElementById('lp').addEventListener('change', function() {
            self.lp.frequency.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("lp-value");
            label.innerHTML = this.value + "Hz";
        });
        this.shadowRoot.getElementById('hp').addEventListener('change', function() {
            self.hp.frequency.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("hp-value");
            label.innerHTML = this.value + "Hz";
        });

        this.shadowRoot.getElementById('threshold').addEventListener('change', function() {
            var n =  self.audioContext.currentTime;
            for(var c = 0; c < self.compressor.length; c++){
                self.compressor[c].threshold.setValueAtTime(this.value, n);
            }
            var label = self.shadow.getElementById("threshold-value");
            label.innerHTML = this.value + "dB";
        });
        this.shadowRoot.getElementById('ratio').addEventListener('change', function() {
            var n =  self.audioContext.currentTime;
            for(var c = 0; c < self.compressor.length; c++){
                self.compressor[c].ratio.setValueAtTime(this.value, n);
            }
            var label = self.shadow.getElementById("ratio-value");
            label.innerHTML = this.value + " : 1";
        });
        this.shadowRoot.getElementById('attack').addEventListener('change', function() {
            var n =  self.audioContext.currentTime;
            for(var c = 0; c < self.compressor.length; c++){
                self.compressor[c].attack.setValueAtTime(this.value, n);
            }
            var label = self.shadow.getElementById("attack-value");
            label.innerHTML = this.value + "ms";
        });
        this.shadowRoot.getElementById('release').addEventListener('change', function() {
            var n =  self.audioContext.currentTime;
            for(var c = 0; c < self.compressor.length; c++){
                self.compressor[c].release.setValueAtTime(this.value, n);
            }
            var label = self.shadow.getElementById("release-value");
            label.innerHTML = this.value + "ms";
        });

        this.shadow.getElementById("waveform_1").addEventListener('click', function(e){
            var bound = this.getBoundingClientRect();
            if(e.clientY < self.canvasHeight / 2){
                var value = e.clientX - bound.left;
                if( value >= self.startPosition && value <= self.endPosition){
                    var isChrome = window.chrome;
                    if(isChrome) {  
                        if(self.isPlaying){
                            self.restartChrome = true;
                            self.restartPoint = multitrackPlayer.map_range(value, 0, self.canvasWidth, 0, 1);
                            self.stop();
                        } 
                        else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvasWidth, 0, 1), true);
                    }
                    else{
                        if(self.isPlaying){
                            if(self.source.loop){
                                self.stop();
                                self.restartAt(multitrackPlayer.map_range(value, 0, self.canvasWidth, 0, 1), true);
                            }
                            else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvasWidth, 0, 1), true);
                        }
                        else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvasWidth, 0, 1), true);
                    }
                }
            }
        })
        this.shadow.getElementById("waveform_1").addEventListener('mousedown', function(e){
            var bound = this.getBoundingClientRect();
            var x = e.clientX - bound.left;
            if(e.clientY > self.canvasHeight / 2){   //Se premi nella metà inferiore
                var dist = self.endPosition - self.startPosition;
                
                if(Math.abs(x - self.startPosition) < dist * 0.2){
                    //console.log("move start");
                    self.moveStart = true;
                    self.moveEnd = false;
                    self.drag = false;
                }
                else if (Math.abs(self.endPosition - x) < dist * 0.2){
                    //console.log("move end")
                    self.moveStart = false;
                    self.moveEnd = true;
                    self.drag = false;
                }
                else if(x > self.startPosition + (dist * 0.2) && x < self.endPosition - (dist * 0.2)){
                    //DRAG
                    self.moveStart = false;
                    self.moveEnd = false;
                    self.drag = true;
                    self.off = x - self.startPosition;
                }
            }
        })

        this.shadow.getElementById("waveform_1").addEventListener('mousemove', function(e){
            var bound = this.getBoundingClientRect();
            var x = e.clientX - bound.left;           
            if(self.moveStart){
                //console.log("move start");
                self.point1 = Math.min(Math.max(e.clientX - bound.left, 0), self.canvasWidth);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();
                }
                self.updateBounds(multitrackPlayer.map_range(self.point1, 0, self.canvasWidth, 0, 1), multitrackPlayer.map_range(self.point2 , 0, self.canvasWidth, 0, 1));
            }
            else if (self.moveEnd){
                //console.log("move end")
                self.point2 = Math.min(Math.max(e.clientX - bound.left, self.startPosition), self.canvasWidth);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();   
                }
                self.updateBounds(self.startPoint, multitrackPlayer.map_range(self.point2, 0, self.canvasWidth, 0, 1));
            }
            else if (self.drag){
                //console.log("move start");
                var distStart = -(self.point1 - (e.clientX - bound.left));
                var dist = self.endPosition - self.startPosition;
                self.point1 = Math.min(Math.max(self.point1 + distStart - self.off, 0), self.canvasWidth);
                self.point2 = Math.min(Math.max(self.point1 + dist, 0), self.canvasWidth);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();
                }
                self.updateBounds(multitrackPlayer.map_range(self.point1, 0, self.canvasWidth, 0, 1), multitrackPlayer.map_range(self.point2 , 0, self.canvasWidth, 0, 1));
            
            }
            
        })

        this.shadow.getElementById("waveform_1").addEventListener('mouseup', function(e){
            var bound = this.getBoundingClientRect();

            if(self.moveStart){
                self.moveStart = false;
                self.moveEnd = false;  
                self.drag = false;  
                var isChrome = window.chrome;
                if(self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
            else if (self.moveEnd){
                self.moveStart = false;
                self.moveEnd = false; 
                self.drag = false;
                if(self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
            else if(self.drag){
                self.moveStart = false;
                self.moveEnd = false; 
                self.drag = false;
                if(self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
            if(self.clicking){
                self.point2 = Math.min(Math.max(e.clientX - bound.left, 0), self.canvasWidth);
                self.clicking = false;
                self.updateBounds(multitrackPlayer.map_range(Math.min(self.point1, self.point2), 0, self.canvasWidth, 0, 1), multitrackPlayer.map_range(Math.max(self.point1, self.point2), 0, self.canvasWidth, 0, 1));
                var isChrome = window.chrome;
                if(isChrome && self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
        })
    }
    static eventFire(el, etype){
        if (el.fireEvent) {
          el.fireEvent('on' + etype);
        } else {
          var evObj = document.createEvent('Events');
          evObj.initEvent(etype, true, false);
          el.dispatchEvent(evObj);
        }
    }
}

window.customElements.define("multitrack-player", multitrackPlayer);