const template = document.createElement('template');
template.innerHTML = 
`
<!doctype html>
<html lang="en">
<div id="box-np-main">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
    <link href="/player/style.css" rel="stylesheet" type="text/css">  
    <div id="player">
        <div id="canvasDiv">
            <div id="tracks" class="row no-space">
            </div>
            <div id="ui">
            </div>
    
            <div id="analysers" class="row-no-space" style="display:flex;">
            </div>
            <div id="master">
            </div>
        </div>    
        <div id="sotto" class="row">
            <div id="transport" class="col-md-6">
                    <button id="btn-np-backward">BW</button>
                    <button id="btn-np-play">Play</button>
                    <button id="btn-np-pause" style="display:none;">Pause</button>
                    <button id="btn-np-stop">Stop</button>  
                    <button id="btn-np-forward">FW</button>
                    <input id="btn-np-loop" type="checkbox">loop</input>
            </div>
            <div id="volumeDiv" class="col-md-2">
                <input id="volumeSlider" type="range" min="0.00000001" max="4" value="1" step="0.0001">
                <p id="volume-value">0dB</p>
            </div>
            <div id="parameters" class="col-md-4">
                <button class="tablinks" id="filter">filter</button>
                <button class="tablinks" id="equalizer">equalizer</button>
                <button class="tablinks" id="compressor">compressor</button>
                <button class="tablinks" id="limiter">limiter</button>
                <button class="tablinks" id="preGain">pre gain</button>
            </div>
        </div>
        <div id="piuSotto" class="row">
            <div class="tabcontent" id="filterDiv" class="col-md-8">
                <div>
                    <input id="rotation" type="range" min="0" max="1" value="0.5" step="0.01">Rotation</input>
                </div>
                <div>
                    <input id="lp" type="range" min="20" max="20000" value="19999" step="1">Low Pass Filter</input>
                    <p id="lp-value">20000Hz</p>
                </div>
                <div>
                    <input id="hp" type="range" min="20" max="20000" value="20" step="1">High Pass Filter</input>
                    <p id="hp-value">20Hz</p>
                </div>
            </div>
            <div class="tabcontent" id="equalizerDiv" class="col-md-8">
                
    
            </div>
            <div class="tabcontent" id="compressorDiv">
                <div>
                    <input id="compEnabled" type="checkbox">Enabled</input>
                </div>
                <div>
                    <input id="threshold" type="range" min="-90" max="0" value="0" step="0.01">threshold</input>
                    <p id="threshold-value">0dB</p>
                </div>
                <div>
                    <input id="ratio" type="range" min="1" max="48" value="1" step="0.01">ratio</input>
                    <p id="ratio-value">1 : 1</p>
                </div>
                <div>
                    <input id="attack" type="range" min="0" max="50" value="10" step="0.01">attack</input>
                    <p id="attack-value">10ms</p>
                </div>
                <div>
                    <input id="release" type="range" min="0" max="50" value="10" step="0.01">release</input>
                    <p id="release-value">10ms</p>
                </div>
            </div>
            <div class="tabcontent" id="limiterDiv">
                <div>
                    <input id="limEnabled" type="checkbox">Enabled</input>
                </div>
                <div>
                    <input id="lim_threshold" type="range" min="-90" max="0" value="0" step="0.01">threshold</input>
                    <p id="lim_threshold-value">0dB</p>
                </div>
                <div>
                    <input id="lim_attack" type="range" min="0" max="50" value="10" step="0.01">attack</input>
                    <p id="lim_attack-value">10ms</p>
                </div>
                <div>
                    <input id="lim_release" type="range" min="0" max="50" value="10" step="0.01">release</input>
                    <p id="lim_release-value">10ms</p>
                </div>
            </div>
            <div class="tabcontent" id="preGainDiv">
                <div>
                    <input id="preGainSlider" type="range" min="0.00000001" max="4" value="1" step="0.0001">
                    <p id="preGain-value">0dB</p>
                </div>
            </div>
        </div>
    </div>
</div>
</html>
`

/*


         
*/


var eqFreq = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

class multitrackPlayer extends HTMLElement{
    constructor(){
        super();
        this._authorized = this.getAttribute('auth');
        this._isOwner = this.getAttribute('isOwner');

        console.log(this._isOwner);
        
        //Add template html
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadow = this.shadowRoot;
        
        var compBtn = this.shadowRoot.getElementById("compressor");
        var limBtn = this.shadowRoot.getElementById("limiter");
        var gainBtn = this.shadowRoot.getElementById("preGain");

        if(this._isOwner == 'true'){
            compBtn.style.display = "block";
            limBtn.style.display = "block";
            gainBtn.style.display = "block";
        }
        else{
            compBtn.style.display = "none";
            limBtn.style.display = "none";
            gainBtn.style.display = "none";
        }

        //Close all param tabs
        var tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
        for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        this.widthMulti = this.getAttribute('widthMultiplier');
        this.heightMulti = this.getAttribute('heightMultiplier');
        
        //Create two draw context
        this.context = new Array(2);
        this.canvas = {};
        this.canvas.whole = this.shadowRoot.querySelector('#box-np-main').scrollWidth * this.widthMulti;
        //
        this.canvas.waveWidth = (this.canvas.whole / 20) * 19 - (this.canvas.whole / 12) ;
        this.canvas.waveHeight = this.canvas.waveWidth * this.heightMulti;
        
        this.canvas.meterWidth = this.canvas.whole / 20;
        this.canvas.meterHeight = this.canvas.waveHeight;
        

        this.canvas.analyserWidth = this.canvas.waveWidth + this.canvas.meterWidth;
        this.canvas.analyserHeight =  this.canvas.waveHeight / 6;

        console.log(this.canvas.analyserWidth);
        console.log(this.canvas.waveWidth + this.canvas.meterWidth);
        //this.canvasWidth = this.shadowRoot.querySelector('#ui').scrollWidth * 
        //this.canvasHeight = this.shadowRoot.querySelector('#ui').scrollWidth * this.widthMulti * this.heightMulti;
    
        //Create audio context
        var AudioContext = window.AudioContext || window.webkitAudioContext || false;
        if (AudioContext){
            this.audioContext = new AudioContext();
        }
        else{
            alert("Sorry, your browser doesn't support function needed for this player");
        }
        this.audioContext.destination.channelCountMode = "clamped-max";
        this.audioContext.destination.channelInterpretation = "explicit";

        //Initialize variables 
        var self = this;
        this.channels = this.audioContext.destination.maxChannelCount;
        this.lastTime = 0;
        this.source = null;
        this.currentBuffer = null;
        this.loop = false;
        this.isPlaying = false;
        this.restartPoint = 0;
        this.playheadPosition = 0;
        this.startPoint = 0;
        this.endPoint = 1;
        this.startPosition = 0;
        this.endPosition = this.canvas.waveWidth;
        this.point1 = 0;
        this.point2 = this.canvas.waveWidth;

        this.colors = {};
        this.colors.waveform = this.getAttribute('waveformRGB').split(',');
        this.colors.waveformBackground = this.getAttribute('waveformBackground').split(',');
        this.colors.analyzer = this.getAttribute('analyzerRGB').split(',');
        this.colors.analyzerBackground = this.getAttribute('analyzerBackground').split(',');
        this.colors.analyserStyle = this.getAttribute('analyzerStyle');
        this.colors.analyserSize = this.getAttribute('analyzerFFTSize');
        this.colors.uiColor = this.getAttribute('uiRGB').split(',');
        this.colors.textColor = this.getAttribute('textRGB').split(',');
        this.colors.meter = {};
        this.colors.meter.muted = this.getAttribute('mutedRGB').split(',');
        this.colors.meter.mutedClipping = this.getAttribute('mutedClippingRGB').split(',');
        this.colors.meter.unmuted = this.getAttribute('unmutedRGB').split(',');
        this.colors.meter.unmutedClipping = this.getAttribute('unmutedClippingRGB').split(',');

        this.font = this.getAttribute('font');

        //dB to amplitude ratio =>   ratio=10^(dB)/10)
        //amplitude ratio to dB =>   dB=10*log10(ratio) 
        this.preGainValue = Math.pow(10 , (this.getAttribute('preGain') / 10));

        this.compressore = {};
        this.compressore.enabled = this.getAttribute('comp_enabled');
        this.compressore.ratio = this.getAttribute('comp_ratio');
        this.compressore.attack = this.getAttribute('comp_attack');
        this.compressore.release = this.getAttribute('comp_release');
        this.compressore.threshold = this.getAttribute('comp_threshold');

        this.limiterParameters = {};
        this.limiterParameters.enabled = this.getAttribute('lim_enabled');
        this.limiterParameters.attack = this.getAttribute('lim_attack');
        this.limiterParameters.release = this.getAttribute('lim_release');
        this.limiterParameters.threshold = this.getAttribute('lim_threshold');

        if(this.compressore.enabled == 'true' && this._isOwner == 'true'){
            this.shadow.getElementById('compEnabled').checked = true;
            this.shadow.getElementById('ratio').value = this.compressore.ratio;
            this.shadow.getElementById('attack').value = this.compressore.attack;
            this.shadow.getElementById('release').value = this.compressore.release;
            this.shadow.getElementById('threshold').value = this.compressore.threshold;
            self.shadow.getElementById("threshold-value").innerHTML = this.shadow.getElementById('ratio').value + "dB";
            self.shadow.getElementById("ratio-value").innerHTML = this.shadow.getElementById('attack').value + " : 1";
            self.shadow.getElementById("attack-value").innerHTML = this.shadow.getElementById('release').value + "ms";
            self.shadow.getElementById("release-value").innerHTML = this.shadow.getElementById('threshold').value + "ms";
        } 
        if(this.limiterParameters.enabled == 'true' && this._isOwner == 'true'){
            this.shadow.getElementById('limEnabled').checked = true;
            this.shadow.getElementById('lim_attack').value = this.limiterParameters.attack;
            this.shadow.getElementById('lim_release').value = this.limiterParameters.release;
            this.shadow.getElementById('lim_threshold').value = this.limiterParameters.threshold;
            self.shadow.getElementById("lim_attack-value").innerHTML = this.shadow.getElementById('lim_attack').value + "ms";
            self.shadow.getElementById("lim_release-value").innerHTML = this.shadow.getElementById('lim_release').value + "ms";
            self.shadow.getElementById("lim_threshold-value").innerHTML = this.shadow.getElementById('lim_threshold').value + "dB";
        }

        if(this._isOwner == 'true'){
            this.shadow.getElementById('preGainSlider').value = this.preGainValue;
            self.shadow.getElementById("preGain-value").innerHTML = (10 * Math.log10(this.shadow.getElementById('preGainSlider').value)).toFixed(1) + "dB";
        }

        //Create initial audio nodes chain
        this.createAudioNodes();
        

        //Load file encoding configuration from "encoding" attribute
        this.encoding = this.getAttribute('encoding');
        //Load channel configuration from "layout" attribute
        var layout = this.getAttribute('layout');
        this.configuration = layout.split(',');
        console.log(this.configuration);
        //Load audio from "file" attribute and call "loaded" function if everything is fine
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

    createAudioNodes(){
        this.createEq();
        this.preGain = this.audioContext.createGain();                              //first gain process after input
        this.preGain.gain.setValueAtTime(this.preGainValue, this.audioContext.currentTime);
        this.gain = this.audioContext.createGain();                                //last gain process before output
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp = this.audioContext.createBiquadFilter();                          //lowpass filter
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.lp.type = "lowpass";
        this.lp.frequency.setValueAtTime(20000, this.audioContext.currentTime);
        this.hp = this.audioContext.createBiquadFilter();                          //hipass filter
        this.hp.type = "highpass";
        this.hp.frequency.setValueAtTime(20, this.audioContext.currentTime);

        this.compressor = new Array(this.audioContext.destination.channelCount);   //create array of mono compressors since each node can't handle more than 2 channels
        if(this.compressore.enabled == 'true'){
            for(var i = 0; i < this.audioContext.destination.channelCount; i++){
                this.compressor[i] = this.audioContext.createDynamicsCompressor();
                this.compressor[i].channelCountMode = "explicit";
                this.compressor[i].channelCount = 1;
            }
        }

        this.limiter = new Array(this.audioContext.destination.channelCount);   //create array of mono compressors since each node can't handle more than 2 channels
        if(this.limiterParameters.enabled == 'true'){
            for(var i = 0; i < this.audioContext.destination.channelCount; i++){
                this.limiter[i] = this.audioContext.createDynamicsCompressor();
                this.limiter[i].ratio.setValueAtTime("100", this.audioContext.currentTime);
                this.limiter[i].channelCountMode = "explicit";
                this.limiter[i].channelCount = 1;
            }
        }
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.minDecibel = -80;
        this.analyser.maxDecibel = 0;
        this.analyser.channelCount = 1;
        this.analyser.fftSize = this.colors.analyserSize;
    };
    
    createEq(){
        var self = this;
        //Create 10 peaking audio nodes
        this.eq = new Array(10);
        for(var i = 0; i < this.eq.length; i++){
            this.eq[i] = this.audioContext.createBiquadFilter();
            this.eq[i].channelCount = this.audioContext.destination.channelCount;
            this.eq[i].type = "peaking";
            this.eq[i].frequency.setValueAtTime(eqFreq[i], this.audioContext.currentTime);
        }

        var clr = document.createElement("div");
        clr.setAttribute("class", "clr");

        //Assign sliders to frequency gain parameter
        var elementEq = this.shadow.getElementById('equalizerDiv');
        for(var i = 0; i < this.eq.length; i++){
            var box = document.createElement("div");
            box.setAttribute("class", "np-box-eq-bar");
            
            var nEq = document.createElement("input");
            nEq.number = i;
            nEq.id = "eq_" + i;
            nEq.type = "range";
            nEq.min = -10;
            nEq.max = 10;
            nEq.value = 0;
            nEq.step = 0.001;
            nEq.setAttribute("orient", "vertical");
            nEq.setAttribute("class", "np-eq-bar");
            box.appendChild(nEq);
            nEq.addEventListener('change', function() {
                self.eq[this.number].gain.setValueAtTime(this.value, self.audioContext.currentTime);
            });

            var label = document.createElement("span");
            label.id = "eq_label_" + i;
            label.innerHTML = eqFreq[i];
            box.appendChild(label);
            elementEq.appendChild(box);
        }
        elementEq.appendChild(clr);
    }

    static async loadAudio(url) {                                                // Load Audio buffer and fill this.source   
        var self = this;
        return new Promise(function (resolve, reject){
            var req = new XMLHttpRequest();
            req.open( "GET", url, true );
            req.responseType = "arraybuffer";   
            req.onreadystatechange = function (e) {
                if (req.readyState == 4) {
                    if(req.status == 200){
                        resolve(req);
                }}};
            req.onerror = reject; 
            req.send();
        });
    }

    loaded(req) {                                                                     //Fill self.source and self.currentBuffer with decoded audio
        var self = this;
            this.audioContext.decodeAudioData(req.response, 
            function (buffer){
                if(self.encoding === "MONO" && self.audioContext.destination.maxChannelCount > 1) self.audioContext.destination.channelCount = 2;
                else self.audioContext.destination.channelCount = Math.min(self.audioContext.destination.maxChannelCount, buffer.numberOfChannels);
                self.source = self.audioContext.createBufferSource();
                self.source.channelCount = self.audioContext.destination.channelCount;
                self.currentBuffer = buffer;
                self.source.buffer = buffer;
                self.updateChannels();
                self.displayAndConnect();
            }, self.onDecodeError);
    };
    onDecodeError() {  alert('error while decoding your file.');  }

   
    updateChannels(){                                                                //Update channel count for audio nodes
        this.source.channelCount = this.audioContext.destination.channelCount;
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.compressor = new Array(this.audioContext.destination.channelCount);
        this.limiter = new Array(this.audioContext.destination.channelCount);

        console.log("compressore: " + this.compressore.enabled);
        if(this.compressore.enabled == 'true'){
            console.log("qui!");
            for(var i = 0; i < this.audioContext.destination.channelCount; i++){
                this.compressor[i] = this.audioContext.createDynamicsCompressor();
                this.compressor[i].channelCountMode = "explicit";
                this.compressor[i].channelCount = 1;
                this.compressor[i].ratio.setValueAtTime(this.compressore.ratio, this.audioContext.currentTime);
                this.compressor[i].threshold.setValueAtTime(this.compressore.threshold, this.audioContext.currentTime);
                this.compressor[i].attack.setValueAtTime(this.compressore.attack, this.audioContext.currentTime);
                this.compressor[i].release.setValueAtTime(this.compressore.release, this.audioContext.currentTime);
            }
        }
        if(this.limiterParameters.enabled == 'true'){
            for(var i = 0; i < this.audioContext.destination.channelCount; i++){
                this.limiter[i] = this.audioContext.createDynamicsCompressor();
                this.limiter[i].ratio.setValueAtTime("100", this.audioContext.currentTime);
                this.limiter[i].channelCountMode = "explicit";
                this.limiter[i].channelCount = 1;
                this.limiter[i].threshold.setValueAtTime(this.limiterParameters.threshold, this.audioContext.currentTime);
                this.limiter[i].attack.setValueAtTime(this.limiterParameters.attack, this.audioContext.currentTime);
                this.limiter[i].release.setValueAtTime(this.limiterParameters.release, this.audioContext.currentTime);
            }
        }
        this.updateOutput();        
    }

    updateOutput(){
        this.eq[this.eq.length - 1].disconnect();
        this.postComp = null;
        this.postLim = null;
        this.splitComp = null;
        this.mergeComp = null;
        this.splitLim = null;
        this.mergeLim = null;
        if(this.audioContext.destination.channelCount > 2){   //Connect multichannel eq out to single channel compressors and merge output in a single post-compression multichannel signal
            this.splitComp = this.audioContext.createChannelSplitter(this.source.buffer.numberOfChannels);
            this.mergeComp = this.audioContext.createChannelMerger(this.audioContext.destination.channelCount);
            this.eq[this.eq.length - 1].connect(this.splitComp);
            if(this.compressore.enabled){
                for(var c = 0; c < this.compressor.length; c++){
                    this.splitComp.connect(this.compressor[c], c, 0);
                    this.compressor[c].connect(this.mergeComp[c], 0, c);
                }
            }
            else this.splitComp.connect(this.mergeComp); 
            
            this.splitLim = this.audioContext.createChannelSplitter(this.source.buffer.numberOfChannels);
            this.mergeLim = this.audioContext.createChannelMerger(this.audioContext.destination.channelCount);
            this.mergeComp.connect(this.splitLim);
            if(this.limiterParameters.enabled){
                for(var c = 0; c < this.limiter.length; c++){
                    this.splitLim.connect(this.limiter[c], c, 0);
                    this.limiter[c].connect(this.mergeLim[c], 0, c);
                }
            }
            else this.splitLim.connect(this.mergeLim); 
            
            this.mergeLim.connect(this.gain);
            
        }
        else{  //Connect stereo eq out to stereo compressor
            this.postComp = this.audioContext.createGain();
            this.postLim = this.audioContext.createGain();
            this.postComp.channelCount = 2;
            this.postLim.channelCount = 2;
            
            if(this.compressore.enabled == 'true'){
                this.compressor[0].channelCount = 2;
                this.eq[this.eq.length - 1].connect(this.compressor[0]);
                this.compressor[0].connect(this.postComp);
            }
            else this.eq[this.eq.length - 1].connect(this.postComp);

            if(this.limiterParameters.enabled == 'true'){
                this.limiter[0].channelCount = 2;
                this.postComp.connect(this.limiter[0]);
                this.limiter[0].connect(this.postLim);
            }
            else this.postComp.connect(this.postLim);
            this.postLim.connect(this.gain);
        }
    }

    displayAndConnect(){
        var tracksDiv = this.shadow.getElementById('tracks');
        for(var i = 0; i < this.source.buffer.numberOfChannels; i++){
            var trackDiv = document.createElement('div');
            trackDiv.id = "track_" + i;
            trackDiv.setAttribute("class", "col-md-12-h-100");
            trackDiv.style.height = Number(this.canvas.waveHeight/ this.source.buffer.numberOfChannels).toFixed(0) + "px";
            tracksDiv.append(trackDiv);
        }
        
        
        this.canvas.track = new Array(this.source.buffer.numberOfChannels);
        this.canvas.meterHeight = this.canvas.waveHeight / this.source.buffer.numberOfChannels;
        this.createMutes(this.source.buffer);         //Create remaining audio nodes, about muting and routing
        for(var i = 0; i < this.source.buffer.numberOfChannels; i++){
            this.canvas.track[i] = {};
            this.canvas.track[i].muted = false; 
            this.canvas.track[i].wave = this.createCanvas("wave", i, this.canvas.waveWidth, this.canvas.waveHeight / this.source.buffer.numberOfChannels); //wave
            this.canvas.track[i].meter = this.createCanvas("trackMeter", i, this.canvas.meterWidth, this.canvas.meterHeight); //meter
        }
        this.canvas.ui = this.createCanvas("ui", 0, this.canvas.waveWidth, this.canvas.waveHeight); //playehead
        this.canvas.master = this.createCanvas("masterMeter", 0, this.canvas.meterWidth, this.canvas.meterHeight); //master meters
       
        //Calculate starting points and duration
        this.activeBufferDuration = this.currentBuffer.duration;
        this.source.loopStart = 0;
        this.source.loopEnd = this.currentBuffer.duration;

        this.displayFileInfo();        //Inject title and duration into HTML
        multitrackPlayer.displayBuffer(this, this.analyzeData(this.source.buffer)); //Analyze buffer samples and draw them into first canvas
        this.canvas.analyserWidth += this.shadow.getElementById('muteLabel_' + 0).scrollWidth;
        //console.log(this.canvas.analyserWidth + "/" + (this.canvas.waveWidth + this.canvas.meterWidth + this.shadow.getElementById('muteLabel_' + 0).scrollWidth));
        this.canvas.analyser = this.createCanvas("analyser", 0, this.canvas.analyserWidth, this.canvas.analyserHeight); //spectrum
        
        this.lp.connect(this.hp);                  //Connect nodes
        this.hp.connect(this.eq[0]);               //Connect hipass to first peaking eq
        for(var i = 0; i < this.eq.length; i++){   
            if(i == this.eq.length - 1){ 
            }
            else this.eq[i].connect(this.eq[i + 1]);   //Connect eq in series
        }
        this.updateOutput();
        if(this._authorized === 'true'){        //If the user is authorized connect multichannel out
            this.gain.connect(this.audioContext.destination);
        } 
        else{                                   //If the user is not authorized merge to mono and connect to speakers
            this.monoMerge = this.audioContext.createChannelMerger(1);
            this.gain.connect(this.monoMerge);
            this.monoMerge.connect(this.audioContext.destination, 0, 0);
        }
        this.analyserMonoMerge = this.audioContext.createChannelMerger(1);
        this.analyserGainControl = this.audioContext.createGain();
        this.analyserGainControl.gain.setValueAtTime(1.0 / this.source.buffer.numberOfChannels, this.audioContext.currentTime);
        this.gain.connect(this.analyserGainControl);
        this.analyserGainControl.connect(this.analyserMonoMerge);
        this.analyserMonoMerge.connect(this.analyser);

        this.addCallbacks();    //Adds UI callbacks

        //DEBUG LOG
        console.log("Detected active channels: " + this.audioContext.destination.channelCount + " / " + this.audioContext.destination.maxChannelCount);
        console.log("buffer: " + this.source.buffer.numberOfChannels);
        console.log("source: " + this.source.channelCount);
        console.log("muteSplitter: " + this.muteSplitter.channelCount);
        console.log("mutes: " + this.mutes[0].channelCount);
        //console.log("merger: " + this.routesMerger.channelCount);
        console.log("lp: " + this.lp.channelCount);
        console.log("eq: " + this.eq[0].channelCount);
        if(this.compressore.enabled == 'true')  console.log("compressor: " + this.compressor[0].channelCount);
        if(this.limiterParameters.enabled == 'true')  console.log("limiter: " + this.limiter[0].channelCount);
        //console.log("compressor: " + this.compressor[1].channelCount);
        console.log("gain: " + this.gain.channelCount);
        console.log("destination: " + this.audioContext.destination.channelCount);
    }

    
    createCanvas (type, index, w, h ) {     //Create canvas element
        var newCanvas = document.createElement('canvas');
        newCanvas.width  = w;
        newCanvas.height = h;
        if (type === "ui"){
            var uiDiv = this.shadow.getElementById('ui');
            var waves = this.shadow.getElementById('wave0');
            uiDiv.style.position = "absolute";
            uiDiv.style.top = waves.offsetTop + "px";
            uiDiv.style.left = waves.offsetLeft + "px";
            uiDiv.style.zIndex = "11";
            
            newCanvas.id = "uiCanvas";
            //newCanvas.setAttribute("class", "col-md-8-h-100");
            uiDiv.appendChild(newCanvas);
        }
        else if (type === "analyser"){
            var analyserDiv = this.shadow.getElementById('analysers');
            newCanvas.id = "analyser" + index;
            //newCanvas.setAttribute("class", "col-md-8-h-100");
            analyserDiv.appendChild(newCanvas);
        }
        else if (type === "masterMeter"){
            var masterDiv = this.shadow.getElementById('master');
            newCanvas.id = "masterMeter" + index;
            //masterDiv.appendChild(newCanvas);
        }
        else{
            var trackDiv = this.shadow.getElementById('track_' + index);
            if (type === "wave"){
                newCanvas.id = "wave" + index;

                newCanvas.setAttribute("class", "col-md-8-h-100");
                trackDiv.appendChild(newCanvas);
            }
            else if (type === "trackMeter"){
                newCanvas.id = "trackMeter" + index;
                newCanvas.setAttribute("class", "col-md-1-h-100");
                trackDiv.appendChild(newCanvas);
            }
        }
        return newCanvas.getContext('2d');
    }
  
    displayFileInfo(){    //Inject title and duration into HTML
        //var main = this.shadow.getElementById("main");
        //var infos = document.createElement("h3");
        //infos.innerHTML = "Title: " + this.getAttribute('filename') + " Lenght: " + this.currentBuffer.duration + "s";
        //main.prepend(infos);
    }

    recreateBuffer(){
        var self = this;
        self.source = self.audioContext.createBufferSource();
        self.source.buffer = self.currentBuffer;
        self.source.loop = self.loop;
        self.source.loopStart = self.calculateTime(self.startPoint);
        self.source.loopEnd = self.calculateTime(self.endPoint);
        self.source.connect(self.preGain);
    }

    createMutes(buffer){
        var self = this;
        self.muteSplitter = self.audioContext.createChannelSplitter(buffer.numberOfChannels); //splitter to divide channel from source to single channels for muting
        self.muteMerger = self.audioContext.createChannelMerger(buffer.numberOfChannels); //merger to re-merge single channels into multichannel post muting
        self.source.connect(self.preGain);
        self.preGain.connect(self.muteSplitter);
        self.mutes = new Array(buffer.numberOfChannels);            //create a gain node and bind the mute checkbox for each channel in buffer
        self.colors.tracks = new Array(buffer.numberOfChannels); 
       
        for(var i = 0; i < buffer.numberOfChannels; i++){
            var trackDiv = self.shadow.getElementById('track_' + i);
            self.mutes[i] = self.audioContext.createGain();
            self.mutes[i].channelCount = 1;
            self.mutes[i].gain.setValueAtTime(1, self.audioContext.currentTime);
            self.muteSplitter.connect(self.mutes[i], i);
            self.mutes[i].connect(self.muteMerger, 0, i);
            var nMute = document.createElement("input");
            nMute.setAttribute("class", "chk-mute-channel");
            nMute.setAttribute("data-count", i);
            nMute.setAttribute("data-count", self.configuration[i]);
            nMute.number = i;
            nMute.type = "checkbox";
            nMute.style.display = 'none';

            nMute.addEventListener('click', function(){
                //console.log("mute " + this.number + " = " + this.checked); 
                self.canvas.track[this.number].muted = this.checked; 
                self.mutes[this.number].gain.setValueAtTime(this.checked ? 0 : 1, self.audioContext.currentTime);
            });

            var spn = document.createElement('span')
            spn.innerHTML = self.configuration[i];

            //spn.style.position = "absolute";
            spn.style.margin = "auto"
            //spn.style.textAlign = "center";
            //spn.style.top = "50%";
            
            var lbl = document.createElement('label');
            lbl.appendChild(nMute);
            lbl.appendChild(spn);
            lbl.id = "muteLabel_" + i;
            lbl.style.margin = '0px';
            lbl.style.font = this.font;
            
            //lbl.style.display = "inline-block";
            //lbl.style.height = self.canvas.meterHeight + "px";
            self.colors.tracks[i] = {};
            self.colors.tracks[i].mute = new Array(3);
            for (var k = 0; k < self.colors.tracks[i].mute.length; k++){
                self.colors.tracks[i].mute[k] = Math.random() * 80 + 150;
            } 
            lbl.style.backgroundColor = 'rgb(' + self.colors.tracks[i].mute[0] + ',' + self.colors.tracks[i].mute[1] + ',' + self.colors.tracks[i].mute[2] + ')';
            lbl.setAttribute("class", "col-md-1");
            trackDiv.appendChild(lbl);
        }
        if(self.encoding === "B-Format"){
            self.binDecoder = new ambisonics.binDecoder(self.audioContext, parseInt(self.configuration[0]));                 //create B-Format to binaural decoder
            self.sceneRotator = new ambisonics.sceneRotator(self.audioContext, parseInt(self.configuration[0]));
            //self.sceneRotator.yaw = 0;
            //self.sceneRotator.updateRotMtx();
            self.muteMerger.connect(self.sceneRotator.in);                                           //connect merger to scene rotator
            self.sceneRotator.out.connect(self.binDecoder.in);                                                  //connect scene rotator to lowpass filter
            self.binDecoder.out.connect(self.lp)
            
        }
        else{      
            self.routeSplitter = self.audioContext.createChannelSplitter(buffer.numberOfChannels); //splitter to divide channels from post muting to rearrange channels accoring to configuration
            self.routesMerger = self.audioContext.createChannelMerger(self.channels);    //merger post routing
            self.muteMerger.connect(self.routeSplitter);
            self.routes = new Array(self.channels);
            for(var i = 0; i < self.routes.length; i++){                                      //create dummy gain node for each channel in buffer
                self.routes[i] = self.audioContext.createGain();
                self.routes[i].channelCount = 1;
                self.routes[i].gain.setValueAtTime(1, self.audioContext.currentTime);
            }
            if (self.encoding === "MS"){
                for(var i = 0; i < buffer.numberOfChannels; i++){                                  //connect each splitted channel to selected dummy gain node
                    if(self.configuration[i] === 'M'){
                        
                        self.routeSplitter.connect(self.routes[0], i);
                        if(self.channels > 1) self.routeSplitter.connect(self.routes[1], i);
                    }
                    else if(self.configuration[i] === 'S'){
                        
                        self.nonPhaseInversion = self.audioContext.createGain();                    //create dummy gain with gain = 1
                        self.nonPhaseInversion.gain.setValueAtTime(1, self.audioContext.currentTime);
                        self.routeSplitter.connect(self.nonPhaseInversion, i);
                        self.nonPhaseInversion.connect(self.routes[0]);                         //attach to left
                        
                        self.phaseInversion = self.audioContext.createGain();                       //create dummy gain for phase inversion with gain = -1
                        self.phaseInversion.gain.setValueAtTime(-1, self.audioContext.currentTime);
                        self.routeSplitter.connect(self.phaseInversion, i);
                        self.phaseInversion.connect(self.routes[1 % self.channels]);                            //attach to right
                    }   
                 }
            }
            else if (self.encoding === "MONO"){
                for(var i = 0; i < buffer.numberOfChannels; i++){                                  //connect each splitted channel to selected dummy gain node
                    console.log("connecting ch: " + i + " to " + self.configuration[i]);
                    if(self.configuration[i] === 'C' || self.configuration[i] === 'M'){
                        self.gainL = self.audioContext.createGain();                    //create dummy gain with gain = 1
                        self.gainR = self.audioContext.createGain();                    //create dummy gain with gain = 1
                        self.gainL.gain.setValueAtTime(1, self.audioContext.currentTime);
                        self.gainR.gain.setValueAtTime(1, self.audioContext.currentTime);
                        
                        self.routeSplitter.connect(self.gainL, i);
                        self.routeSplitter.connect(self.gainR, i);

                        self.gainL.connect(self.routes[0], i);
                        self.gainR.connect(self.routes[1 % self.channels], i);
                    }             
                }
            }
            else{
                for(var i = 0; i < buffer.numberOfChannels; i++){                                  //connect each splitted channel to selected dummy gain node
                    console.log("connecting ch: " + i + " to " + self.configuration[i]);
                    if(self.configuration[i] === 'L') self.routeSplitter.connect(self.routes[0], i);
                    else if(self.configuration[i] === 'R') self.routeSplitter.connect(self.routes[1 % self.channels], i);
                    else if(self.configuration[i] === 'LS') self.routeSplitter.connect(self.routes[2 % self.channels], i);
                    else if(self.configuration[i] === 'RS') self.routeSplitter.connect(self.routes[3 % self.channels], i);
                    else if(self.configuration[i] === 'C' || self.configuration[i] === 'M'){
                        self.routeSplitter.connect(self.routes[0], i);
                        self.routeSplitter.connect(self.routes[1 % self.channels], i);
                    }
                    else if(self.configuration[i] === 'LFE'){
                        //subwoofer?
                    }                    
                }
            }
            for(var i = 0; i < self.channels; i++){
                self.routes[i].connect(self.routesMerger, 0, i);                               //connect each dummy gain node to merger
            }
            self.routesMerger.connect(self.lp);                                                     //connect sorted multichannel to lowpass filter
        }

        //METERS
        self.trackMeters = new Array(buffer.numberOfChannels);
        for(var i = 0; i < buffer.numberOfChannels; i++){                                  //connect each splitted channel to selected dummy gain node
            self.trackMeters[i] = createAudioMeter(self.audioContext);
            self.muteSplitter.connect(self.trackMeters[i], i);
        }

        self.masterMeter = createAudioMeter(self.audioContext);
        self.gain.connect(self.masterMeter);
    }
    
    
    analyzeData(buff) {             //da capire, ridurre i samples per visualizzare meglio, per ora bypass
        return buff;
    }

    static displayBuffer(obj, buff) {       // Clear canvas and draw every channel of the buffer
        var self = obj;
        //self.context[0].save();

        for(var c = 0; c < buff.numberOfChannels; c++){
            self.canvas.track[c].wave.fillStyle  = 'rgb(' + self.colors.waveformBackground[0] + ',' + self.colors.waveformBackground[1] + ',' + self.colors.waveformBackground[2]  + ')';
            self.canvas.track[c].wave.fillRect(0, 0, self.canvas.waveWidth, self.canvas.waveHeight);
            self.canvas.track[c].wave.strokeStyle = 'rgb(' + self.colors.waveform[0] + ',' + self.colors.waveform[1] + ',' + self.colors.waveform[2]  + ')';
 
            self.canvas.track[c].wave.translate(0, (self.canvas.waveHeight / buff.numberOfChannels) / 2);
            self.canvas.track[c].wave.beginPath();
            var thisChannel = buff.getChannelData(c);
            for(var x = 0; x < self.canvas.waveWidth; x++){
                var s = multitrackPlayer.map_range(x, 0, self.canvas.waveWidth, 0, thisChannel.length);
                var y = multitrackPlayer.map_range(thisChannel[parseInt(s)], 0, 1, 1, self.canvas.waveHeight / buff.numberOfChannels);
                self.canvas.track[c].wave.moveTo( x, 0 );
                self.canvas.track[c].wave.lineTo( x, y );
                self.canvas.track[c].wave.stroke();
            }
            //self.context[0].translate(0,(self.canvas.waveHeight / buff.numberOfChannels) / 2);
        }
        //self.context[0].restore();
        //console.log('done');
        window.requestAnimationFrame(multitrackPlayer.drawPlayhead.bind(self));     //start animation loop for drawPlayhead
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

    static fillRoundRect (ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y,   x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x,   y+h, r);
        ctx.arcTo(x,   y+h, x,   y,   r);
        ctx.arcTo(x,   y,   x+w, y,   r);
        ctx.closePath();
        ctx.fill();
    };    
    
    static secToMin(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        var hDisplay = h > 0 ? h + ":" : "";
        var mDisplay = m > 0 ? m : "0";
        var sDisplay = s > 0 ? s >= 10 ? s : "0" + s : "00";
        return String(hDisplay + mDisplay + ":" + sDisplay); 
    }

    static drawPlayhead() {
        var uiDiv = this.shadow.getElementById('ui');
        var waves = this.shadow.getElementById('wave0');
        uiDiv.style.position = "absolute";
        uiDiv.style.top = waves.offsetTop + "px";
        uiDiv.style.left = waves.offsetLeft + "px";
        uiDiv.style.zIndex = "11";
        
        if(this.isPlaying){
            this.shadowRoot.getElementById('btn-np-play').style.display = "none";
            this.shadowRoot.getElementById('btn-np-pause').style.display = "inline-block";
        } 
        else{ 
            this.shadowRoot.getElementById('btn-np-play').style.display = "inline-block";
            this.shadowRoot.getElementById('btn-np-pause').style.display = "none";
        }

        this.activeBufferDuration = this.source.loopEnd - this.source.loopStart;
        this.now = this.audioContext.currentTime;

        this.startPosition = multitrackPlayer.map_range(this.startPoint, 0, 1, 1, this.canvas.waveWidth -1);
        this.endPosition = multitrackPlayer.map_range(this.endPoint, 0, 1, 1, this.canvas.waveWidth -1);

        this.canvas.ui.clearRect(0,0, this.canvas.waveWidth, this.canvas.waveHeight);
        this.canvas.ui.save();

        
        /*
        //Start/End Labels
        this.canvas.ui.fillStyle = 'rgba(0, 0, 0, 1)';
        this.canvas.ui.textAlign = "left";
        this.canvas.ui.fillText("0:00", 0, 20);
        this.canvas.ui.textAlign = "right";
        this.canvas.ui.fillText(Number(this.currentBuffer.duration / 60).toFixed(2).replace(/\./g, ":"), this.canvasWidth, 20);
        */

        //PLAYHEAD
        if(!this.moveStart && !this.moveEnd && !this.drag){
            if(this.isPlaying){
                if(this.now - this.lastTime >= this.activeBufferDuration ){
                    this.lastTime = this.now - (this.now - (this.lastTime + this.activeBufferDuration)); //lastTime = timer all'ultimo start
                }
                this.elapsed = ((this.now - this.lastTime) % this.activeBufferDuration);
            }
           else this.lastTime = this.now;
            var position = multitrackPlayer.map_range(this.elapsed + this.source.loopStart, 0, this.currentBuffer.duration, 0, this.canvas.waveWidth);
            this.playheadPosition = position / this.canvas.waveWidth;
            this.canvas.ui.fillStyle = '#f22';
            this.canvas.ui.beginPath();
            this.canvas.ui.moveTo(position, 0);
            this.canvas.ui.lineTo(position, this.canvas.waveHeight);
            this.canvas.ui.lineTo(position + 4, this.canvas.waveHeight);
            this.canvas.ui.lineTo(position + 4, 0);
            this.canvas.ui.closePath();
            this.canvas.ui.fill();
        }

    
        this.canvas.ui.strokeStyle = '#222';
        //START
        this.canvas.ui.beginPath();
        this.canvas.ui.moveTo(this.startPosition, 0);
        this.canvas.ui.lineTo(this.startPosition, this.canvas.waveHeight);
        this.canvas.ui.stroke();
        this.canvas.ui.strokeStyle = '#222';

        //END
        this.canvas.ui.beginPath();
        this.canvas.ui.moveTo(this.endPosition, 0);
        this.canvas.ui.lineTo(this.endPosition, this.canvas.waveHeight);
        this.canvas.ui.stroke();

        this.canvas.ui.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.canvas.ui.beginPath();
        this.canvas.ui.fillRect(this.startPosition, 0, this.endPosition - this.startPosition, this.canvas.waveHeight)
    

        this.canvas.ui.fillStyle = 'rgb('+ this.colors.uiColor[0] +','+ this.colors.uiColor[1] +','+ this.colors.uiColor[2] +')';
        
        //START HANDLE
        this.canvas.ui.rect(this.startPosition - (this.canvas.waveWidth * 0.01), 0, (this.canvas.waveWidth * 0.01), this.canvas.waveHeight);
        this.canvas.ui.fill();

        //END HANDLE
        this.canvas.ui.rect(this.endPosition , 0, (this.canvas.waveWidth * 0.01), this.canvas.waveHeight);
        this.canvas.ui.fill();

        //START LABEL RECT
        this.canvas.ui.fillRect(this.startPosition, 0, 40, 30)
        multitrackPlayer.fillRoundRect(this.canvas.ui, this.startPosition, 0, 50, 30, 10);

        //END LABEL RECT
        this.canvas.ui.fillRect(this.endPosition - 40, 0, 40, 30)
        multitrackPlayer.fillRoundRect(this.canvas.ui, this.endPosition - 50, 0, 50, 30, 10);

    
        this.canvas.ui.font = this.font;
        var startText = multitrackPlayer.secToMin(this.source.loopStart);
        var endText = multitrackPlayer.secToMin(this.source.loopEnd);
      
        
        //START LABEL
        this.canvas.ui.textAlign = "left";
        this.canvas.ui.fillStyle = 'rgb('+ this.colors.textColor[0] +','+ this.colors.textColor[1] +','+ this.colors.textColor[2] +')';
        this.canvas.ui.fillText(startText, this.startPosition, 20);
        //this.canvas.ui.fillText(String(Number(this.source.loopStart / 60).toFixed(0)) + ":" + String(Number(this.source.loopStart % 60).toFixed(0)), this.startPosition, 20);
        
        
        //END LABEL
        this.canvas.ui.textAlign = "right";
        this.canvas.ui.fillText(endText, this.endPosition, 20); 
    

        
        this.canvas.ui.restore();


        //FREQ ANALYSER

        
        
        var freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(freqData);      
        var scaling = this.canvas.analyserHeight / 256;
        var space = (this.canvas.analyserWidth * (this.source.buffer.numberOfChannels + 1))/ freqData.length;
        var xPos = 0;
        
        this.canvas.analyser.clearRect(0,0, this.canvas.analyserWidth, this.canvas.analyserHeight);
        
        this.canvas.analyser.fillStyle =  'rgb(' + this.colors.analyzerBackground[0] + ',' + this.colors.analyzerBackground[1] + ',' + this.colors.analyzerBackground[2]  + ')';
        this.canvas.analyser.fillRect(0, 0, this.canvas.analyserWidth, this.canvas.analyserHeight);
        
        this.canvas.analyser.strokeStyle = 'rgb(' + this.colors.analyzer[0] + ',' + this.colors.analyzer[1] + ',' + this.colors.analyzer[2]  + ')';
        this.canvas.analyser.fillStyle = 'rgb(' + this.colors.analyzer[0] + ',' + this.colors.analyzer[1] + ',' + this.colors.analyzer[2]  + ')';
        
        if (this.colors.analyserStyle == "bars"){
            for (var x = 0; x < this.canvas.analyserWidth; x++){
                xPos = x * space;
                var barHeight = freqData[x] * scaling;
                this.canvas.analyser.fillRect(xPos, this.canvas.analyserHeight - barHeight, space, barHeight);
             }
        }
        else if (this.colors.analyserStyle == "line"){
            this.canvas.analyser.lineWidth = 2;
            this.canvas.analyser.beginPath();
            this.canvas.analyser.lineTo(xPos, this.canvas.analyserHeight);
            for (var x = 0; x < this.canvas.analyserWidth; x++){
                xPos = x * space;
                var barHeight = freqData[x] * scaling;
                this.canvas.analyser.lineTo(xPos, this.canvas.analyserHeight - barHeight);
            }
            this.canvas.analyser.lineTo(xPos, this.canvas.analyserHeight);
            this.canvas.analyser.lineTo(0, this.canvas.analyserHeight);
            this.canvas.analyser.stroke();
            this.canvas.analyser.fill();
        }

        //Mute Colors

        for(var i = 0; i < this.canvas.track.length; i++){
            var muteLabel = this.shadow.getElementById('muteLabel_' + i);
            if (this.canvas.track[i].muted) muteLabel.style.backgroundColor = 'rgb(' + (150) + ',' + (150) + ',' + (150) + ')';
            else muteLabel.style.backgroundColor = 'rgb(' + (this.colors.tracks[i].mute[0]) + ',' + (this.colors.tracks[i].mute[1]) + ',' + (this.colors.tracks[i].mute[2]) + ')';
        }

        //Track Meters
        for(var i = 0; i < this.canvas.track.length; i++){
            this.canvas.track[i].meter.clearRect(0,0, this.canvas.meterWidth, this.canvas.meterHeight);
            var isClipping = this.trackMeters[i].checkClipping();
            if(this.canvas.track[i].muted == true && isClipping == false) this.canvas.track[i].meter.fillStyle = 'rgb(' + this.colors.meter.muted[0] + ',' + this.colors.meter.muted[1] + ',' + this.colors.meter.muted[2]  + ')';
            if(this.canvas.track[i].muted == true && isClipping == true) this.canvas.track[i].meter.fillStyle = 'rgb(' + this.colors.meter.mutedClipping[0] + ',' + this.colors.meter.mutedClipping[1] + ',' + this.colors.meter.mutedClipping[2]  + ')';
            if(this.canvas.track[i].muted == false && isClipping == false) this.canvas.track[i].meter.fillStyle = 'rgb(' + this.colors.meter.unmuted[0] + ',' + this.colors.meter.unmuted[1] + ',' + this.colors.meter.unmuted[2]  + ')';
            if(this.canvas.track[i].muted == false && isClipping == true) this.canvas.track[i].meter.fillStyle = 'rgb(' + this.colors.meter.unmutedClipping[0] + ',' + this.colors.meter.unmutedClipping[1] + ',' + this.colors.meter.unmutedClipping[2]  + ')';
            // draw a bar based on the current volume
            this.canvas.track[i].meter.fillRect(0,  this.canvas.meterHeight - (this.canvas.meterHeight * 3 * this.trackMeters[i].volume),  this.canvas.meterWidth, this.canvas.meterHeight * 3 * this.trackMeters[i].volume );
        }


        //Master Meter
        this.canvas.master.clearRect(0,0, this.canvas.meterWidth, this.canvas.meterHeight);
        if (this.masterMeter.checkClipping()) this.canvas.master.fillStyle = 'rgb(' + this.colors.meter.unmutedClipping[0] + ',' + this.colors.meter.unmutedClipping[1] + ',' + this.colors.meter.unmutedClipping[2]  + ')';
        else  this.canvas.master.fillStyle = 'rgb(' + this.colors.meter.unmuted[0] + ',' + this.colors.meter.unmuted[1] + ',' + this.colors.meter.unmuted[2]  + ')';
        // draw a bar based on the current volume
        this.canvas.master.fillRect(0, this.canvas.meterHeight -( this.canvas.meterHeight * 3 * this.masterMeter.volume ),  this.canvas.meterWidth, this.canvas.meterHeight * 3 * this.masterMeter.volume );
   
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
        self.isPlaying = true;
        self.source.start(self.audioContext.currentTime, self.calculateTime(playPos), self.calculateTime(self.endPoint) - self.calculateTime(playPos));
        self.source.addEventListener('ended', () => {
            if(!self.loop){
                self.stop();
                self.restartPoint = null;
            } 
            else{
                var isChrome = window.chrome;
                if(isChrome && !self.restartChrome) {
                    self.restartAt(self.startPoint, false);
                } 
                else if (isChrome && self.restartChrome){
                    self.restartChrome = false;
                    self.mettiPlay(self.restartPoint);
                    self.restartPoint = self.loopStart;
                }
                else if (self.isChrome && self.clicking) self.stop();
            }
        });
    }

    stop(){
        var self = this;
        self.isPlaying = false; 
        self.source.stop(this.audioContext.currentTime);
        self.recreateBuffer();
    }

    openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        var switcher = this.shadow.getElementById(tabName+'Div').style.display == "flex" ? true : false;
        tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = this.shadowRoot.querySelectorAll(".tablinks");    
        if(switcher) this.shadow.getElementById(tabName+'Div').style.display = "none"
        else this.shadow.getElementById(tabName+'Div').style.display = "flex";
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
        this.shadowRoot.getElementById('btn-np-play').addEventListener('click', function(){
            if(!self.isPlaying){
                self.lastTime = self.audioContext.currentTime;
                if(self.restartPoint != null){
                    if(isNaN(self.restartPoint)) self.restartPoint = self.startPoint;
                    self.restartAt(self.restartPoint, true);
                }
                else{
                    console.log(self.startPoint);
                    self.mettiPlay(self.startPoint);
                }
                self.restartPoint = null;
            }
        });
        this.shadowRoot.getElementById('btn-np-pause').addEventListener('click', function(){
            self.lastTime = self.audioContext.currentTime;
            self.stop();
            self.restartPoint = self.playheadPosition;
        });
        this.shadowRoot.getElementById('btn-np-stop').addEventListener('click', function(){
            self.lastTime = self.audioContext.currentTime;
            if(self.isPlaying){
                self.stop();
            }
            self.restartAt(self.startPoint, false);
            self.restartPoint = null;
        });
        
        this.shadowRoot.getElementById('btn-np-forward').addEventListener('click', function(){
            console.log("FORWARD!")            
            self.restartPoint = Math.min(self.playheadPosition + 0.1, self.endPoint);
            if(self.restartPoint == self.endPoint) self.restartPoint = self.startPoint;
            console.log(self.restartPoint);
            var isChrome = window.chrome;
            if(isChrome && self.isPlaying) self.restartChrome = true;
            self.restartAt(self.restartPoint, self.isPlaying);            
        });
        this.shadowRoot.getElementById('btn-np-backward').addEventListener('click', function(){
            console.log("BACK!")            
            self.restartPoint = Math.max(self.playheadPosition - 0.1, self.startPoint);
            var isChrome = window.chrome;
            if(isChrome && self.isPlaying) self.restartChrome = true;
            self.restartAt(self.restartPoint, self.isPlaying);
        });
        this.shadowRoot.getElementById('btn-np-loop').addEventListener('click', function() {
            self.loop = this.checked;
            self.source.loop = self.loop;
        });
        this.shadowRoot.getElementById('rotation').addEventListener('change', function() {
            if(self.encoding === "B-Format"){
                this.newRot = multitrackPlayer.map_range(this.value, 0, 1, 0, 360);
                self.sceneRotator.yaw = this.newRot;
                self.sceneRotator.updateRotMtx();
            }
            else if (self.encoding === "MS"){
                this.newWidth = multitrackPlayer.map_range(this.value, 0, 1, -1, 1);
                self.nonPhaseInversion.gain.setValueAtTime(this.newWidth, self.audioContext.currentTime);
                self.phaseInversion.gain.setValueAtTime(-this.newWidth, self.audioContext.currentTime);
            }
            else if (self.encoding === "MONO"){
                this.newPan = multitrackPlayer.map_range(this.value, 0, 1, -1, 1);
                self.gainL.gain.setValueAtTime(1 - this.value, self.audioContext.currentTime);
                self.gainR.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            }
            console.log(this.value);
        });
        this.shadowRoot.getElementById('volumeSlider').addEventListener('change', function() {
            self.gain.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("volume-value");
            label.innerHTML = (10 * Math.log10(this.value)).toFixed(1) + "dB";
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
        
        if(this._isOwner == 'true'){
            this.shadowRoot.getElementById('preGain').addEventListener('click', function(e){
                self.openTab(e, this.id);
            });
            this.shadowRoot.getElementById('preGainSlider').addEventListener('change', function() {
                self.preGainValue = this.value;
                self.preGain.gain.setValueAtTime(this.value, self.audioContext.currentTime);
                var label = self.shadow.getElementById("preGain-value");
                label.innerHTML = (10 * Math.log10(this.value)).toFixed(1) + "dB";
            });
            this.shadowRoot.getElementById('compEnabled').addEventListener('click', function(){
                self.compressore.enabled = this.checked ? 'true' : 'false'; 
                self.updateChannels();
            });
            this.shadowRoot.getElementById('compressor').addEventListener('click', function(e){
                self.openTab(e, this.id);
            });
            this.shadowRoot.getElementById('threshold').addEventListener('change', function() {
                self.compressore.threshold = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.compressor.length; c++){
                    self.compressor[c].threshold.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("threshold-value");
                label.innerHTML = this.value + "dB";
            });
            this.shadowRoot.getElementById('ratio').addEventListener('change', function() {
                self.compressore.ratio = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.compressor.length; c++){
                    self.compressor[c].ratio.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("ratio-value");
                label.innerHTML = this.value + " : 1";
            });
            this.shadowRoot.getElementById('attack').addEventListener('change', function() {
                self.compressore.attack = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.compressor.length; c++){
                    self.compressor[c].attack.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("attack-value");
                label.innerHTML = this.value + "ms";
            });
            this.shadowRoot.getElementById('release').addEventListener('change', function() {
                self.compressore.release = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.compressor.length; c++){
                    self.compressor[c].release.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("release-value");
                label.innerHTML = this.value + "ms";
            });

            //LIMITER

            this.shadowRoot.getElementById('limEnabled').addEventListener('click', function(){
                self.limiterParameters.enabled = this.checked ? 'true' : 'false'; 
                self.updateChannels();
            });

            this.shadowRoot.getElementById('limiter').addEventListener('click', function(e){
                self.openTab(e, this.id);
            });

            this.shadowRoot.getElementById('lim_threshold').addEventListener('change', function() {
                self.limiterParameters.threshold = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.limiter.length; c++){
                    self.limiter[c].threshold.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("lim_threshold-value");
                label.innerHTML = this.value + "dB";
            });
            this.shadowRoot.getElementById('lim_attack').addEventListener('change', function() {
                self.limiterParameters.attack = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.limiter.length; c++){
                    self.limiter[c].attack.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("lim_attack-value");
                label.innerHTML = this.value + "ms";
            });
            this.shadowRoot.getElementById('lim_release').addEventListener('change', function() {
                self.limiterParameters.release = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.limiter.length; c++){
                    self.limiter[c].release.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("lim_release-value");
                label.innerHTML = this.value + "ms";
            });
        }
        this.shadow.getElementById("ui").addEventListener('click', function(e){
            var bound = this.getBoundingClientRect();
            if(e.clientY < self.canvas.waveHeight / 2){
                var value = e.clientX - bound.left;
                if( value >= self.startPosition && value <= self.endPosition){
                    var isChrome = window.chrome;
                    if(isChrome) {  
                        if(self.isPlaying){
                            self.restartChrome = true;
                            self.restartPoint = multitrackPlayer.map_range(value, 0, self.canvas.waveWidth, 0, 1);
                            self.stop();
                        } 
                        else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvas.waveWidth, 0, 1), true);
                    }
                    else{
                        if(self.isPlaying){
                            if(self.source.loop){
                                self.stop();
                                self.restartAt(multitrackPlayer.map_range(value, 0, self.canvas.waveWidth, 0, 1), true);
                            }
                            else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvas.waveWidth, 0, 1), true);
                        }
                        else self.restartAt(multitrackPlayer.map_range(value, 0, self.canvas.waveWidth, 0, 1), true);
                    }
                }
            }
        })
        this.shadow.getElementById("ui").addEventListener('mousedown', function(e){
            var bound = this.getBoundingClientRect();
            var x = e.clientX - bound.left;
            if(e.clientY > self.canvas.waveHeight / 2){   //Se premi nella metà inferiore
                self.restartPoint = self.playheadPosition;
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
        this.shadow.getElementById("ui").addEventListener('mousemove', function(e){
            var bound = this.getBoundingClientRect();
            var x = e.clientX - bound.left;           
            if(self.moveStart){
                //console.log("move start");
                self.point1 = Math.min(Math.max(e.clientX - bound.left, 0), self.endPosition);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();
                }
                self.updateBounds(multitrackPlayer.map_range(self.point1, 0, self.canvas.waveWidth, 0, 1), multitrackPlayer.map_range(self.point2 , 0, self.canvas.waveWidth, 0, 1));
            }
            else if (self.moveEnd){
                //console.log("move end")
                self.point2 = Math.min(Math.max(e.clientX - bound.left, self.startPosition), self.canvas.waveWidth);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();   
                }
                self.updateBounds(self.startPoint, multitrackPlayer.map_range(self.point2, 0, self.canvas.waveWidth, 0, 1));
            }
            else if (self.drag){
                //console.log("move start");
                var distStart = -(self.point1 - (e.clientX - bound.left));
                var dist = self.endPosition - self.startPosition;
                self.point1 = Math.min(Math.max(self.point1 + distStart - self.off, 0), self.canvas.waveWidth);
                self.point2 = Math.min(Math.max(self.point1 + dist, 0), self.canvas.waveWidth);
                if(self.isPlaying) {
                    self.keepChrome = true;
                    self.stop();
                }
                self.updateBounds(multitrackPlayer.map_range(self.point1, 0, self.canvas.waveWidth, 0, 1), multitrackPlayer.map_range(self.point2 , 0, self.canvas.waveWidth, 0, 1));
            }
        })
        this.shadow.getElementById("ui").addEventListener('mouseup', function(e){
            var bound = this.getBoundingClientRect();
            if(self.moveStart){
                self.moveStart = false;
                self.moveEnd = false;  
                self.drag = false;  
                
                if(self.restartPoint < self.startPoint) {
                    self.restartPoint = self.startPoint;
                    self.restartAt(self.startPoint, false);
                }
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
                if(self.restartPoint > self.endPoint){
                    self.restartPoint = self.startPoint;
                    self.restartAt(self.startPoint, false);
                } 
                if(self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
            else if(self.drag){
                self.moveStart = false;
                self.moveEnd = false; 
                self.drag = false;

                if(self.restartPoint < self.startPoint || self.restartPoint > self.endPoint){
                    self.restartPoint = self.startPoint;
                    self.restartAt(self.startPoint, false);
                } 
                if(self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
            if(self.clicking){
                self.point2 = Math.min(Math.max(e.clientX - bound.left, 0), self.canvas.waveWidth);
                self.clicking = false;
                self.updateBounds(multitrackPlayer.map_range(Math.min(self.point1, self.point2), 0, self.canvas.waveWidth, 0, 1), multitrackPlayer.map_range(Math.max(self.point1, self.point2), 0, self.canvas.waveWidth, 0, 1));
                var isChrome = window.chrome;
                if(isChrome && self.keepChrome){
                    self.keepChrome = false;
                    self.restartAt(self.startPoint, true);
                } 
            }
        })
        self.shadow.getElementById("box-np-main").style.opacity = 1;
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