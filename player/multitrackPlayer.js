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

            <div id="time">
            </div>

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
            <div id="zoomDiv" class="col-md-2">
            <p>zoom</p>
            <input  type="range" id="zoomSlider"min="0" max="1" value="0" step="0.01"></input>
            <p id="zoom-value">0%</p>
            <p>scroll</p>
            <input  type="range" id="scrollSlider"min="0" max="1" value="0" step="0.01"></input>
            <p id="scroll-value">0%</p>
            <input id="btn-np-autoscroll" type="checkbox"> Auto-Scroll</input>
            </div>
            <div id="rotationDiv" class="col-md-2">
                <input type="range" id="rotation"  min="0" max="1" value="0.5" step="0.01"></input>
                <p id="rotLab"></p>
            </div>
            <div id="volumeDiv" class="col-md-2">
                <input type="range" id="volumeSlider" min="0.00000001" max="4" value="1" step="0.0001">
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
                    <input type="range" id="lp" min="15000" max="20000" value="20000" step="1">Low Pass Filter</input>
                    <p id="lp-value">20000Hz</p>
                </div>
                <div>
                    <input type="range" id="hp"  min="20" max="300" value="20" step="1">High Pass Filter</input>
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
                    <input  type="range" id="threshold"min="-90" max="0" value="0" step="0.01">threshold</input>
                    <p id="threshold-value">0dB</p>
                </div>
                <div>
                    <input  type="range" id="ratio"min="1" max="48" value="1" step="0.01">ratio</input>
                    <p id="ratio-value">1 : 1</p>
                </div>
                <div>
                    <input  type="range" id="attack"min="0" max="50" value="10" step="0.01">attack</input>
                    <p id="attack-value">10ms</p>
                </div>
                <div>
                    <input  type="range" id="release"min="0" max="50" value="10" step="0.01">release</input>
                    <p id="release-value">10ms</p>
                </div>
            </div>
            <div class="tabcontent" id="limiterDiv">
                <div>
                    <input id="limEnabled" type="checkbox">Enabled</input>
                </div>
                <div>
                    <input  type="range" id="lim_threshold"min="-90" max="0" value="0" step="0.01">threshold</input>
                    <p id="lim_threshold-value">0dB</p>
                </div>
                <div>
                    <input  type="range" id="lim_attack"min="0" max="50" value="10" step="0.01">attack</input>
                    <p id="lim_attack-value">10ms</p>
                </div>
                <div>
                    <input  type="range" id="lim_release"min="0" max="50" value="10" step="0.01">release</input>
                    <p id="lim_release-value">10ms</p>
                </div>
            </div>
            <div class="tabcontent" id="preGainDiv">
                <div>
                    <input  type="range" id="preGainSlider"min="0.00000001" max="100" value="1" step="0.0001">
                    <p id="preGain-value">0dB</p>
                </div>
            </div>
        </div>
    </div>
    <div id="output" style="display:none;">
        <p>Channels<p>
        <p id="active-channels">0</p>
        <p>Region</p>
        <p id="region-start">0</p>
        <p id="region-end">0</p>
        <p id="region-duration">0</p>
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

        //console.log(this._isOwner);
        
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
        this.analyserHeightMulti = this.getAttribute('analyserHeightMultiplier');
        
        //Create two draw context
        this.context = new Array(2);
        this.canvas = {};
        this.canvas.whole = this.shadowRoot.querySelector('#box-np-main').scrollWidth * this.widthMulti;
        this.normalizeWave = this.getAttribute('normalizeWave');
        //
        this.canvas.waveWidth = this.canvas.whole  - (this.canvas.whole / 12) ;
        this.canvas.waveHeight = this.canvas.waveWidth * this.heightMulti;
        


        this.canvas.analyserWidth = this.canvas.waveWidth;
        this.canvas.analyserHeight =  this.canvas.waveHeight *  this.analyserHeightMulti;

        //console.log(this.canvas.analyserWidth);
        //console.log(this.canvas.waveWidth + this.canvas.meterWidth);

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
        this.source = null;
        this.currentBuffer = null;
        this.loop = false;
        this.isPlaying = false;
        this.restartPoint = 0;
        this.autoscroll = false;

        this.channelMapping = {};
        this.channelMapping.L = this.getAttribute('channel_L').split(',');
        this.channelMapping.R = this.getAttribute('channel_R').split(',');
        this.channelMapping.C = this.getAttribute('channel_C').split(',');
        this.channelMapping.LS = this.getAttribute('channel_LS').split(',');
        this.channelMapping.RS = this.getAttribute('channel_RS').split(',');
        this.channelMapping.M = this.getAttribute('channel_M').split(',');
        this.channelMapping.S = this.getAttribute('channel_S').split(',');

        for (let prop in this.channelMapping) {
            for(var u = 0; u < this.channelMapping[prop].length; u++){
                this.channelMapping[prop][u] = parseInt(this.channelMapping[prop][u]);
            }
        }

        this.externalJson = this.getAttribute('waveformJSON');
        this.region = {};
        this.region.startSample = 0;
        this.region.endSample = 1;
        this.clicking = false;
        this.zoom = 0;
        this.scroll = 0;
        this.resolution = this.getAttribute('waveformResolution');
        this.scaleMeters = this.getAttribute('autoScaleMeters');
        this.numberOfTimeMarkers = this.getAttribute('timeMarkersNumber');
        this.colors = {};
        this.colors.waveform = this.getAttribute('waveformRGB').split(',');
        this.colors.waveformBackground = this.getAttribute('waveformBackground').split(',');
        this.colors.analyzer = this.getAttribute('analyzerRGB').split(',');
        this.colors.analyzerBackground = this.getAttribute('analyzerBackground').split(',');
        this.colors.analyserStyle = this.getAttribute('analyzerStyle');
        this.colors.analyserSize = this.getAttribute('analyzerFFTSize');
        this.colors.uiColor = this.getAttribute('uiRGB').split(',');
        this.colors.playheadColor = this.getAttribute('playheadRGB').split(',');
        this.colors.textColor = this.getAttribute('textRGB').split(',');
        this.colors.meter = {};
        this.colors.meter.muted = this.getAttribute('mutedRGB').split(',');
        this.colors.meter.mutedClipping = this.getAttribute('mutedClippingRGB').split(',');
        this.colors.meter.unmuted = this.getAttribute('unmutedRGB').split(',');
        this.colors.meter.unmutedClipping = this.getAttribute('unmutedClippingRGB').split(',');


        this.colors.meterRange = this.getAttribute('meterRangeRGB').split(',');

        this.colors.trackBase = this.getAttribute('trackBaseRGB').split(',');
        this.colors.trackAugment = this.getAttribute('trackAugmentRGB').split(',');
        this.colors.trackRandomness = this.getAttribute('trackRandomnessRGB').split(',');
        this.colors.trackMuteBase = this.getAttribute('trackMuteBaseRGB').split(',');
        this.colors.trackMuteOriginal = this.getAttribute('trackMuteOriginalRGB').split(',');

        this.colors.timeline = this.getAttribute('timelineRGB').split(',');


        this.font = this.getAttribute('font');

        this.maxZoomFactor = 1 / 10;

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
            this.shadow.getElementById("lim_attack-value").innerHTML = this.shadow.getElementById('lim_attack').value + "ms";
            this.shadow.getElementById("lim_release-value").innerHTML = this.shadow.getElementById('lim_release').value + "ms";
            this.shadow.getElementById("lim_threshold-value").innerHTML = this.shadow.getElementById('lim_threshold').value + "dB";
        }

        if(this._isOwner == 'true'){
            this.shadow.getElementById('preGainSlider').value = this.preGainValue;
            this.shadow.getElementById("preGain-value").innerHTML = (10 * Math.log10(this.shadow.getElementById('preGainSlider').value)).toFixed(1) + "dB";
        }

        //Create initial audio nodes chain
        this.createAudioNodes();
        

        //Load file encoding configuration from "encoding" attribute
        this.encoding = this.getAttribute('encoding');
        var rot = this.shadow.getElementById('rotLab');
        if(this.encoding === "MONO") rot.innerHTML = 'Pan';
        else if(this.encoding === "MS") rot.innerHTML = 'Width';
        else if (this.encoding === "B-Format") rot.innerHTML = 'Rotation';
        else {
            rot.style.display = 'none';
            this.shadow.getElementById('rotation').style.display = 'none';
        }
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
        this.preGain.channelCount = this.audioContext.destination.channelCount;
        this.preGain.gain.setValueAtTime(this.preGainValue, this.audioContext.currentTime);
        this.gain = this.audioContext.createGain();                                //last gain process before output
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp = this.audioContext.createBiquadFilter();                          //lowpass filter
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.lp.type = "lowpass";
        this.lp.frequency.setValueAtTime(20000, this.audioContext.currentTime);
        this.hp = this.audioContext.createBiquadFilter();                          //hipass filter
        this.hp.channelCount = this.audioContext.destination.channelCount;
        this.hp.type = "highpass";
        this.hp.frequency.setValueAtTime(20, this.audioContext.currentTime);
        this.compressor = new Array(this.audioContext.destination.maxChannelCount);   //create array of mono compressors since each node can't handle more than 2 channels
        if(this.compressore.enabled == 'true'){
            for(var i = 0; i < this.audioContext.destination.channelCount; i++){
                this.compressor[i] = this.audioContext.createDynamicsCompressor();
                this.compressor[i].channelCountMode = "explicit";
                this.compressor[i].channelCount = 1;
            }
        }

        this.limiter = new Array(this.audioContext.destination.maxChannelCount);   //create array of mono compressors since each node can't handle more than 2 channels
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
                self.totalSamples = self.source.buffer.length;
                self.startSample = 0;
                self.spp = self.totalSamples / self.canvas.waveWidth;
                self.samplesMaxZoom = self.totalSamples * self.maxZoomFactor;
                self.updateChannels();
                self.displayAndConnect();
            }, self.onDecodeError);
    };
    onDecodeError() {  alert('error while decoding your file.');  }

   
    updateChannels(){                                                                //Update channel count for audio nodes
        console.log("def chan count: " + this.audioContext.destination.channelCount);
        this.source.channelCount = this.audioContext.destination.channelCount;
        for(let e = 0; e < this.eq.length; e++) this.eq[e].channelCount = this.audioContext.destination.channelCount;
        this.gain.channelCount = this.audioContext.destination.channelCount;
        this.lp.channelCount = this.audioContext.destination.channelCount;
        this.hp.channelCount = this.audioContext.destination.channelCount;
        this.compressor = new Array(this.audioContext.destination.channelCount);
        this.limiter = new Array(this.audioContext.destination.channelCount);

        //console.log("compressore: " + this.compressore.enabled);
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
            this.splitComp.channelCount = this.audioContext.destination.channelCount;
            
            this.eq[this.eq.length - 1].connect(this.splitComp);
            if(this.compressore.enabled == 'true'){
                for(var c = 0; c < this.compressor.length; c++){
                    this.splitComp.connect(this.compressor[c], c, 0);
                    this.compressor[c].connect(this.mergeComp, 0, c);
                }
            }
            else {
                for(let i = 0; i < this.source.buffer.numberOfChannels; i++){
                    this.splitComp.connect(this.mergeComp, i, i); 
                }
            }
            this.splitLim = this.audioContext.createChannelSplitter(this.source.buffer.numberOfChannels);
            this.mergeLim = this.audioContext.createChannelMerger(this.audioContext.destination.channelCount);
            this.splitLim.channelCount = this.audioContext.destination.channelCount;
            this.mergeComp.connect(this.splitLim);
            if(this.limiterParameters.enabled == 'true'){
                for(var c = 0; c < this.limiter.length; c++){
                    this.splitLim.connect(this.limiter[c], c, 0);
                    this.limiter[c].connect(this.mergeLim, 0, c);
                }
            }
            else {
                for(let i = 0; i < this.source.buffer.numberOfChannels; i++){
                    //this.splitLim.connect(this.mergeLim, i, i);
                    //connect each splitted channel to selected dummy gain node
                    if(this.configuration[i] === 'L') {
                        for(var u = 0; u < this.channelMapping.L.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.L[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.L[u % this.channels]);
                        }
                    }
                    else if(this.configuration[i] === 'R') {
                        for(var u = 0; u < this.channelMapping.R.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.R[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.R[u % this.channels]);
                        }
                    }
                    else if(this.configuration[i] === 'LS') {
                        for(var u = 0; u < this.channelMapping.LS.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.LS[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.LS[u % this.channels]);
                        }
                    }
                    else if(this.configuration[i] === 'RS') {
                        for(var u = 0; u < this.channelMapping.RS.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.RS[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.RS[u % this.channels]);
                        }
                    }
                    else if(this.configuration[i] === 'LFE'){
                        for(var u = 0; u < this.channelMapping.LFE.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.LFE[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.LFE[u % this.channels]);
                        }
                        //subwoofer?
                    }                    
                    else if(this.configuration[i] === 'C'){
                        for(var u = 0; u < this.channelMapping.C.length; u++){
                            console.log("connecting ch: " + i + " to " + this.configuration[i] + " (" + this.channelMapping.C[u] % this.channels + ")");
                            this.splitLim.connect(this.mergeLim, i, this.channelMapping.C[u % this.channels]);
                        }
                    }
                }
            }
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

    download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([JSON.stringify(content)], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    async fetchData(url) {
        const response = await fetch(url);
        //console.log(response);
        const data = await response.json();
        return data;
    }
      

    displayAndConnect(){
        this.canvas.time = this.createCanvas("time", 0, this.canvas.waveWidth, this.canvas.waveHeight / 10); //timeline
        this.canvas.time.pointsNumber = this.numberOfTimeMarkers;
        
        var tracksDiv = this.shadow.getElementById('tracks');
        this.colors.tracks = new Array(this.source.buffer.numberOfChannels); 
        for(var i = 0; i < this.source.buffer.numberOfChannels; i++){
            this.colors.tracks[i] = {};
            this.colors.tracks[i].unmuted = new Array(3);
            this.colors.tracks[i].muted = new Array(3);
            for (var k = 0; k < this.colors.tracks[i].unmuted.length; k++){
                this.colors.tracks[i].unmuted[k] = Number(this.colors.trackBase[k]) + Number(this.colors.trackAugment[k] * (i + 1)) + Number(this.colors.trackRandomness[k] * Math.random());
                this.colors.tracks[i].muted[k] = Number(this.colors.trackMuteBase[k]) + Number((this.colors.trackMuteOriginal[k] / 255) * this.colors.tracks[i].unmuted[k]);
            }   
        }
        for(var i = 0; i < this.source.buffer.numberOfChannels; i++){
            var trackDiv = document.createElement('div');
            trackDiv.id = "track_" + i;
            //trackDiv.setAttribute("class", "col-md-12-h-100");
            trackDiv.style.height = Number(this.canvas.waveHeight/ this.source.buffer.numberOfChannels).toFixed(0) + "px";
            tracksDiv.append(trackDiv);
        }        
        this.canvas.track = new Array(this.source.buffer.numberOfChannels);
        this.createMutes(this.source.buffer);         //Create remaining audio nodes, about muting and routing
        for(var i = 0; i < this.source.buffer.numberOfChannels; i++){
            this.canvas.track[i] = {};
            this.canvas.track[i].muted = false; 
            this.canvas.track[i].wave = this.createCanvas("wave", i, this.canvas.waveWidth, this.canvas.waveHeight / this.source.buffer.numberOfChannels); //wave
        }
        this.canvas.ui = this.createCanvas("ui", 0, this.canvas.waveWidth, this.canvas.waveHeight); //playehead
       
        //Calculate starting points and duration
        this.activeBufferDuration = this.currentBuffer.duration;
        this.sampleRate = this.currentBuffer.sampleRate;
        this.source.loopStart = 0;
        this.source.loopEnd = this.currentBuffer.duration;
        
        this.dataToDisplay = new Array (this.source.buffer.numberOfChannels);
        
        if(this.externalJson == undefined){
            this.bufferData = this.bufferToJson(this.source.buffer);
            this.dataToDisplay = this.analyzeData(this.bufferData, this.zoom, this.scroll, Number(this.canvas.waveWidth).toFixed(0), this.resolution);
            this.displayBuffer(this, this.dataToDisplay); //Analyze buffer samples and draw them into first canvas
            this.isReady = true;
        } 
        else{
            this.resolution = 1;
            this.fetchData(this.externalJson).then(data => {
                this.bufferData = this.preprocessExternalData(data);
                this.originalSpp = data.samples_per_pixel;
                this.dataToDisplay = this.analyzeExternalData(this.bufferData, this.zoom, this.scroll, Number(this.canvas.waveWidth).toFixed(0), this.originalSpp);
                this.displayBuffer(this, this.dataToDisplay); //Analyze buffer samples and draw them into first canvas
                this.isReady = true;
              });
        }
     
        //this.download(this.bufferData, "dataToDisplay.json", "application/json");
        
        window.requestAnimationFrame(multitrackPlayer.drawPlayhead.bind(this));     //start animation loop for drawPlayhead
       
        this.region.startSample = 0;
        this.region.endSample = this.totalSamples;
        this.shadow.getElementById("region-start").innerHTML = this.region.startSample;
        this.shadow.getElementById("region-end").innerHTML = this.region.endSample;
        this.shadow.getElementById("region-duration").innerHTML = this.region.endSample - this.region.startSample;
        this.shadow.getElementById("active-channels").innerHTML = this.audioContext.destination.channelCount;
  
        
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
        console.log("Detected active channels: " + this.audioContext.destination.channelCount + " / " + this.audioContext.destination.maxChannelCount);
        this.updateOutput();
        if(this._authorized == 'true'){        //If the user is authorized connect multichannel out
            //this.gain.connect(this.audioContext.destination);
            this.mergeLim.connect(this.audioContext.destination);
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
            uiDiv.style.zIndex = "11";
            newCanvas.id = "uiCanvas";
            uiDiv.appendChild(newCanvas);
        }
        else if (type === "time"){
            var timeDiv = this.shadow.getElementById('time');
            timeDiv.style.zIndex = "9";
            newCanvas.id = "timeCanvas";
            timeDiv.appendChild(newCanvas);
        }
        else if (type === "analyser"){
            var analyserDiv = this.shadow.getElementById('analysers');
            newCanvas.id = "analyser" + index;
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
                //newCanvas.setAttribute("class", "col-md-10-h-100");
                trackDiv.appendChild(newCanvas);
            }
        }
        return newCanvas.getContext('2d');
    }
  

    recreateBuffer(){
        var self = this;
        self.source = self.audioContext.createBufferSource();
        self.source.buffer = self.currentBuffer;
        self.source.loop = self.loop;
        self.source.loopStart = self.sampleToSeconds(self.region.startSample);
        self.source.loopEnd = self.sampleToSeconds(self.region.endSample);
        self.source.connect(self.preGain);
    }

    createMutes(buffer){
        var self = this;
        self.muteSplitter = self.audioContext.createChannelSplitter(buffer.numberOfChannels); //splitter to divide channel from source to single channels for muting
        self.muteMerger = self.audioContext.createChannelMerger(buffer.numberOfChannels); //merger to re-merge single channels into multichannel post muting
        self.source.connect(self.preGain);
        self.preGain.connect(self.muteSplitter);
        self.mutes = new Array(buffer.numberOfChannels);            //create a gain node and bind the mute checkbox for each channel in buffer
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
            
            lbl.style.backgroundColor = 'rgb(' + self.colors.tracks[i].unmuted[0] + ',' + self.colors.tracks[i].unmuted[1] + ',' + self.colors.tracks[i].unmuted[2] + ')';
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
                        self.mid = self.audioContext.createGain();  
                        self.mid.gain.setValueAtTime(1, self.audioContext.currentTime);
                        
                        self.routeSplitter.connect(self.mid, i);

                        self.mid.connect(self.routes[this.channelMapping.M[0] % self.channels], i);
                        self.mid.connect(self.routes[this.channelMapping.M[1] % self.channels], i);
                    }
                    else if(self.configuration[i] === 'S'){

                        self.sides = new Array(2);

                        
                        self.sides[0] = self.audioContext.createGain();   
                        self.nonPhaseInversion = self.audioContext.createGain();                    //create dummy gain with gain = 1
                        self.sides[0].gain.setValueAtTime(1, self.audioContext.currentTime);
                        self.nonPhaseInversion.gain.setValueAtTime(1, self.audioContext.currentTime);

                        self.sides[1] = self.audioContext.createGain();   
                        self.phaseInversion = self.audioContext.createGain();                       //create dummy gain for phase inversion with gain = -1
                        self.sides[1].gain.setValueAtTime(1, self.audioContext.currentTime);
                        self.phaseInversion.gain.setValueAtTime(-1, self.audioContext.currentTime);
                       

                        self.routeSplitter.connect(self.nonPhaseInversion, i);
                        self.nonPhaseInversion.connect(self.sides[0]);                         //attach non-phase inverted to sides
                        
                        self.routeSplitter.connect(self.phaseInversion, i);
                        self.phaseInversion.connect(self.sides[1]);                            //attach pahse inverted to sides
                        
                        self.sides[0].connect(self.routes[this.channelMapping.S[0] % self.channels]);                 //attach side to left speaker
                        self.sides[1].connect(self.routes[this.channelMapping.S[1] % self.channels]);                 //attach side to right speaker
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

                        for(var u = 0; u < this.channelMapping.L.length; u++){
                            self.gainL.connect(self.routes[this.channelMapping.L[u] % self.channels] , i);
                        }
                        for(var u = 0; u < this.channelMapping.R.length; u++){
                            self.gainR.connect(self.routes[this.channelMapping.R[u] % self.channels] , i);
                        }
                    }             
                }
            }
            else{
                for(var i = 0; i < buffer.numberOfChannels; i++){                                  //connect each splitted channel to selected dummy gain node
                    if(self.configuration[i] === 'L') {
                        for(var u = 0; u < this.channelMapping.L.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.L[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.L[u] % self.channels + ")");
                        }
                    }
                    else if(self.configuration[i] === 'R') {
                        for(var u = 0; u < this.channelMapping.R.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.R[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.R[u] % self.channels + ")");
                        }
                    }
                    else if(self.configuration[i] === 'LS') {
                        for(var u = 0; u < this.channelMapping.LS.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.LS[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.LS[u] % self.channels + ")");
                        }
                    }
                    else if(self.configuration[i] === 'RS') {
                        for(var u = 0; u < this.channelMapping.RS.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.RS[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.RS[u] % self.channels + ")");
                        }
                    }
                    else if(self.configuration[i] === 'LFE'){
                        for(var u = 0; u < this.channelMapping.LFE.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.LFE[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.LFE[u] % self.channels + ")");
                        }
                        //subwoofer?
                    }                    
                    else if(self.configuration[i] === 'C'){
                        for(var u = 0; u < this.channelMapping.C.length; u++){
                            self.routeSplitter.connect(self.routes[this.channelMapping.C[u] % self.channels], i);
                            console.log("connecting ch: " + i + " to " + self.configuration[i] + " (" + this.channelMapping.C[u] % self.channels + ")");
                        }
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

    static clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    };

    sampleToPx(sample){
        if (sample >= this.startSample && sample <= Number(this.startSample + (this.canvas.waveWidth * this.spp))){
            let px =  multitrackPlayer.map_range(sample, this.startSample, this.startSample + (this.canvas.waveWidth * this.spp), 0, this.canvas.waveWidth -1);
            if(px >= 0 && px < this.canvas.waveWidth) return px;
            else return "error"
        }
        else if (sample < this.startSample) return false;
        else if (sample > this.startSample + (this.canvas.waveWidth * this.spp)) return true;
    }

    pxToSample(px){
        let sample =  multitrackPlayer.map_range(px, 0, this.canvas.waveWidth, this.startSample, this.startSample + (this.canvas.waveWidth * this.spp));
        return multitrackPlayer.clamp(sample, 0, this.totalSamples -1);
    }

    sampleToSeconds(sample){
        return sample / this.sampleRate;
    }

    secondsToSample(sec){
        return sec * this.sampleRate;
    }

    calculateTimelinePoints() {
        this.canvas.time.points = new Array(this.canvas.time.pointsNumber);
        for(var i = 0; i < this.canvas.time.pointsNumber; i++){
            let space = this.canvas.waveWidth / this.canvas.time.pointsNumber;
            let sample = this.pxToSample(i * space);
            let sec = this.sampleToSeconds(sample);
            this.canvas.time.points[i] = String(multitrackPlayer.secToMin(sec));
        }
    }

    bufferToJson(buff){
        let data = new Array(buff.numberOfChannels);
        for(var c = 0; c < buff.numberOfChannels; c++){
            let thisChannel =  buff.getChannelData(c);
            if(this.normalizeWave == 'true'){
                let max = 0;
                let min = 0;
                for(let i = 0; i < thisChannel.length; i++){
                    max = Math.max(max, thisChannel[i]);
                    min = Math.min(min, thisChannel[i]);
                }
                data[c] = new Array(thisChannel.length);
                for(let i = 0; i < thisChannel.length; i++){
                    data[c][i] = multitrackPlayer.map_range(thisChannel[i], min, max, -1, 1);
                }
            }
            else{
                data[c] = new Array(thisChannel.length);
                for(let i = 0; i < thisChannel.length; i++){
                    data[c][i] = thisChannel[i];
                }
            }
        }
        return data;
    }

    preprocessExternalData(data){
        let output = new Array(data.channels);
        for(let c = 0; c < output.length; c++){
            output[c] = Array(data.data[c].length / 2);
            let max = 0;
            let min = 0;
            for(let i = 0; i < output[c].length; i++){
                max = Math.max(max, data.data[c][i]);
                min = Math.min(min, data.data[c][i]);
            }
            for(let i = 0; i < output[c].length; i++){
                output[c][i] = new Array(2);
                output[c][i][0] = multitrackPlayer.map_range(data.data[c][(i * 2)], min, max, -1, 1);
                output[c][i][1] = multitrackPlayer.map_range(data.data[c][(i * 2) + 1], min, max, -1, 1);
            }
        }
        return output;
    }

    analyzeExternalData(extData, zoom, scroll, width, originalSpp){
        let allChannels = new Array(extData.length);
        this.veryMax = new Array(extData.length);
        for(var c = 0; c < allChannels.length; c++){
            var thisChannel = extData[c];
            let pointsMinimumZoom = thisChannel.length;
            let pointsMaxZoom = Number(thisChannel.length * this.maxZoomFactor).toFixed(0);
            let pointsActualZoom = Number(multitrackPlayer.map_range(zoom, 0, 1, pointsMinimumZoom, pointsMaxZoom)).toFixed(0);
            this.samplesActualZoom = Number(multitrackPlayer.map_range(zoom, 0, 1, this.totalSamples, this.totalSamples * this.maxZoomFactor)).toFixed(0);
            this.spp = Number(this.samplesActualZoom / width).toFixed(0);   
            let hereSpp = (pointsActualZoom / width);   
  
            let scrollSamples = Number(multitrackPlayer.map_range(scroll, 0, 1, 0, (thisChannel.length) - pointsActualZoom)).toFixed(0);
            this.startSample = Number(scrollSamples * originalSpp);
            let startSample = Number(scrollSamples);
            //let skip = Math.ceil(this.spp / resolution );
            let skip = (hereSpp / 1);
            //console.log("skip: " + skip + " odiginalSpp: "  + " actualSpp: " + hereSpp +  " minimumZoom " + pointsMinimumZoom + " allSamples " + this.totalSamples);
            
            let data = new Array(width);
            this.veryMax[c] = 0;
            for(let i = 0; i < width; i++){
                var min = 0;
                var max = 0;
                let pixelStartSample = startSample + (i * hereSpp);

                for(let j = 0; j < hereSpp; j+= skip){
                    var index = Number(pixelStartSample + j).toFixed(0);
                    if (index < thisChannel.length){
                        min = thisChannel[index][0];
                        max = thisChannel[index][1];
                        if(max > this.veryMax[c]) this.veryMax[c] = max;
                    }
                }
                data[i] = [min, max];
            }
            allChannels[c] = data;
        }
        this.calculateTimelinePoints();
        return allChannels;
    }

        
    //buffer, 16, 1 , width, 1
    analyzeData(originalData, zoom, scroll, width, resolution) { 
        let allChannels = new Array(originalData.length);
        this.veryMax = new Array(originalData.length);
        for(var c = 0; c < originalData.length; c++){
            var thisChannel = originalData[c];
            let samplesMinimumZoom = thisChannel.length * 1;
            let samplesMaxZoom = thisChannel.length * this.maxZoomFactor;
            let samplesActualZoom = multitrackPlayer.map_range(zoom, 0, 1, samplesMinimumZoom, samplesMaxZoom).toFixed(0);
            this.spp = (samplesActualZoom / width).toFixed(0);   
            let scrollSamples = multitrackPlayer.map_range(scroll, 0, 1, 0, thisChannel.length - samplesActualZoom).toFixed(0);
            this.startSample = Number(scrollSamples);
            let skip = Math.ceil(this.spp / resolution);
            
            let data = new Array(width);
            this.veryMax[c] = 0;
            for(let i = 0; i < width; i++){
                var min = 0;
                var max = 0;
                let pixelStartSample = this.startSample + (i * this.spp);

                for(let j = 0; j < this.spp; j+= skip){
                    var index = pixelStartSample + j;
                    if (index < thisChannel.length){
                        var val = thisChannel[index];
                        if(val > max) max = val;
                        else if (val < min) min = val;
                        if(val > this.veryMax[c]) this.veryMax[c] = val;
                    }
                }
                data[i] = [min, max];
            }
            allChannels[c] = data;
        }
        this.calculateTimelinePoints();
        return allChannels;
    }

    displayBuffer(self, data) {       // Clear canvas and draw every channel of the buffer
        for(var c = 0; c < data.length; c++){       //for each channel
            self.canvas.track[c].wave.fillStyle  = 'rgb(' + self.colors.waveformBackground[0] + ',' + self.colors.waveformBackground[1] + ',' + self.colors.waveformBackground[2]  + ')';
            self.canvas.track[c].wave.fillRect(0, 0, self.canvas.waveWidth, self.canvas.waveHeight);
            if(self.canvas.track[c].muted) self.canvas.track[c].wave.fillStyle = 'rgb(' + self.colors.tracks[c].muted[0] + ',' + self.colors.tracks[c].muted[1] + ',' + self.colors.tracks[c].muted[2]  + ')';
            else self.canvas.track[c].wave.fillStyle = 'rgb(' + self.colors.tracks[c].unmuted[0] + ',' + self.colors.tracks[c].unmuted[1] + ',' + self.colors.tracks[c].unmuted[2]  + ')';
            let height = self.canvas.waveHeight / (data.length * 2);
            for(var i = 0; i < self.canvas.waveWidth; i++){
                if(data[c][i]){
                    let minPixel = data[c][i][0] * height + height;
                    let maxPixel = data[c][i][1] * height + height;
                    let pixelHeight = maxPixel - minPixel;
                    self.canvas.track[c].wave.fillRect(i, minPixel, 1, pixelHeight);
                }
            }
        }
    }

    //Map value function
    static map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    //Map values (0. to 1.) to (0. to buffer length in seconds)
    //addio per sempre
    calculateTime(x){
        //var mapSeconds = multitrackPlayer.map_range(x, 0, 1, 0, this.currentBuffer.duration);
        var mapSeconds = multitrackPlayer.map_range(x, 0, 1, 0, this.totalSamples);
        
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
        if(this.isReady){
            self = this;
            var uiDiv = this.shadow.getElementById('ui');
            var tracks = this.shadow.getElementById('tracks');
            var waves = this.shadow.getElementById('wave0');
            var time = this.shadow.getElementById('time');
            time.style.position = "absolute";
            time.style.left = waves.offsetLeft + "px";
            tracks.style.top = time.offsetTop + time.height + "px";
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

            let startPx = this.sampleToPx(this.region.startSample);
            let startPosition = startPx == true ? this.canvas.waveWidth : startPx == false ? 0 : startPx;

            let endPx = this.sampleToPx(this.region.endSample);
            let endPosition = endPx == true ? this.canvas.waveWidth : endPx == false ?  0 : endPx;


            //TIMELINE
            this.canvas.time.clearRect(0,0,this.canvas.waveWidth, this.canvas.waveHeight / 10);
            this.canvas.time.fillStyle = 'rgb(' + this.colors.timeline[0] + ',' + this.colors.timeline[1] + ',' + this.colors.timeline[2] + ')';
        
            for(var i = 0; i < this.canvas.time.pointsNumber; i++){
                this.canvas.time.fillRect(i * (this.canvas.waveWidth / this.canvas.time.pointsNumber), 0, 1, this.canvas.waveHeight / 20);
                this.canvas.time.fillText(String(this.canvas.time.points[i]), 5 + i * (this.canvas.waveWidth / this.canvas.time.pointsNumber), this.canvas.waveHeight / 20);
            }
            /*
            for(var i = 0; i < this.canvas.waveWidth; i += (this.canvas.waveWidth / 6)){
                //this.canvas.time.strokeRect(i,0,i+1,this.canvas.waveHeight / 10);
                let textTime = multitrackPlayer.secToMin(Number(this.pxToSample(i) / this.sampleRate));
            //  console.log(textTime));
                //let textTime = String(i);
                this.canvas.time.fillText(String(textTime), i, this.canvas.waveHeight / 20);

            }
            */
            
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

            this.now = this.audioContext.currentTime;
            if(!this.isPlaying) this.startedAt = this.now;
            let elapsed = this.now - this.startedAt;

            if(!this.moveStart && !this.moveEnd && !this.drag){

                this.playHeadSamples = this.secondsToSample(elapsed) + this.restartPoint;

                if(this.autoscroll == true && this.isPlaying == true){
                    let n = this.playHeadSamples;
                    this.shadowRoot.getElementById('scrollSlider').value +=  multitrackPlayer.map_range(n, 0, this.totalSamples, 0, 1);
                    this.scroll = multitrackPlayer.map_range(n, 0, this.totalSamples, 0, 1);
                    if(self.externalJson == 'undefined' || self.externalJson == null) self.dataToDisplay = self.analyzeData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.resolution);
                    else self.dataToDisplay = self.analyzeExternalData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.originalSpp);        
                }

                let playHeadPx = this.sampleToPx(this.playHeadSamples);
                
                if(playHeadPx != true && playHeadPx != false){
                    this.canvas.ui.fillStyle = 'rgb('+ this.colors.playheadColor[0] +','+ this.colors.playheadColor[1] +','+ this.colors.playheadColor[2] +')';
                    this.canvas.ui.beginPath();
                    this.canvas.ui.moveTo(playHeadPx, 0);
                    this.canvas.ui.lineTo(playHeadPx, this.canvas.waveHeight);
                    this.canvas.ui.lineTo(playHeadPx + 4, this.canvas.waveHeight);
                    this.canvas.ui.lineTo(playHeadPx + 4, 0);
                    this.canvas.ui.closePath();
                    this.canvas.ui.fill();
                }
            }

            this.displayBuffer(this, this.dataToDisplay);


            //BRIGHT
            this.canvas.ui.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.canvas.ui.beginPath();
            this.canvas.ui.fillRect(Math.max(startPosition, 0), 0, Math.min(endPosition - startPosition, this.canvas.waveWidth), this.canvas.waveHeight)
            

            this.canvas.ui.fillStyle = 'rgb('+ this.colors.uiColor[0] +','+ this.colors.uiColor[1] +','+ this.colors.uiColor[2] +')';
            
            //START HANDLE
            if(startPosition != true && startPosition != false){
                this.canvas.ui.rect(startPosition - (this.canvas.waveWidth * 0.01), 0, (this.canvas.waveWidth * 0.01), this.canvas.waveHeight);
                this.canvas.ui.fill();
            }
            
            //END HANDLE
            if(endPosition != true && endPosition != false){
                this.canvas.ui.rect(endPosition , 0, (this.canvas.waveWidth * 0.01), this.canvas.waveHeight);
                this.canvas.ui.fill();
            }

            /*
            //START LABEL RECT
            this.canvas.ui.fillRect(startPosition, 0, 40, 30)
            multitrackPlayer.fillRoundRect(this.canvas.ui, startPosition, 0, 50, 30, 10);

            //END LABEL RECT
            this.canvas.ui.fillRect(endPosition - 40, 0, 40, 30)
            multitrackPlayer.fillRoundRect(this.canvas.ui, endPosition - 50, 0, 50, 30, 10);

        
            this.canvas.ui.font = this.font;
            var startText = multitrackPlayer.secToMin(this.source.loopStart);
            var endText = multitrackPlayer.secToMin(this.source.loopEnd);
        
        
            //START LABEL
            this.canvas.ui.textAlign = "left";
            this.canvas.ui.fillStyle = 'rgb('+ this.colors.textColor[0] +','+ this.colors.textColor[1] +','+ this.colors.textColor[2] +')';
            this.canvas.ui.fillText(startText, startPosition, 20);
            //this.canvas.ui.fillText(String(Number(this.source.loopStart / 60).toFixed(0)) + ":" + String(Number(this.source.loopStart % 60).toFixed(0)), startPosition, 20);
            
            
            //END LABEL
            this.canvas.ui.textAlign = "right";
            this.canvas.ui.fillText(endText, endPosition, 20); 
            */

            
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
                var isClipping = this.trackMeters[i].checkClipping();
                var vol;
                if(this.scaleMeters == true) vol = multitrackPlayer.map_range(this.trackMeters[i].volume, 0, this.veryMax[i], 0, 1);
                else vol = this.trackMeters[i].volume;
                if (this.canvas.track[i].muted) muteLabel.style.backgroundColor = 'rgb(' + this.colors.tracks[i].muted[0] + ',' + this.colors.tracks[i].muted[1] + ',' + this.colors.tracks[i].muted[2] + ')';
                else muteLabel.style.backgroundColor = 'rgb(' + Number((this.colors.tracks[i].unmuted[0]) + (vol * this.colors.meterRange[0])) + ',' + Number((this.colors.tracks[i].unmuted[1]) + (vol * this.colors.meterRange[1])) + ',' + Number((this.colors.tracks[i].unmuted[2]) + (vol * this.colors.meterRange[2])) + ')';
            }     
        }  
        window.requestAnimationFrame(multitrackPlayer.drawPlayhead.bind(this));
    };

    //newStart, newEnd in Samples
    updateBounds(newStart, newEnd){
        var self = this;
        this.region.startSample = newStart;
        this.region.endSample = newEnd;
        this.source.loopStart = this.sampleToSeconds(this.region.startSample);
        this.source.loopEnd = this.sampleToSeconds(this.region.endSample);
        this.restartPoint = this.region.startSample;


        this.shadow.getElementById("region-start").innerHTML = this.region.startSample;
        this.shadow.getElementById("region-end").innerHTML = this.region.endSample;
        this.shadow.getElementById("region-duration").innerHTML = this.region.endSample - this.region.startSample;
   }

    //playPos in samples
    mettiPlay(playPos){
        
        var self = this;
        if(self.isPlaying) self.stop();
        self.isPlaying = true;
        self.startedAt = self.audioContext.currentTime;
        if(playPos < 0) playPos = 0;
        if(self.loop && playPos >= self.region.endSample){
            playPos = self.region.startSample;
            self.restartPoint = self.region.startSample;
        }
        if(playPos >= self.region.startSample && playPos < self.region.endSample) self.source.start(self.audioContext.currentTime, self.sampleToSeconds(playPos), self.sampleToSeconds(self.region.endSample) - self.sampleToSeconds(playPos));
        else if (playPos >= self.region.endSample) self.source.start(self.audioContext.currentTime, self.sampleToSeconds(playPos), self.sampleToSeconds(self.totalSamples) - self.sampleToSeconds(playPos));
        else if (playPos < self.region.startSample) self.source.start(self.audioContext.currentTime, self.sampleToSeconds(playPos), self.sampleToSeconds(self.region.endSample) - self.sampleToSeconds(playPos));
        self.source.addEventListener('ended', () => {
            if(self.paused){
                self.paused = false;
            }
            else self.restartPoint = self.region.startSample;
            if(self.loop){
                self.stop();
                self.mettiPlay(self.region.startSample);
            }
            else if(!self.loop){
                self.stop();
            } 
          })
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
                self.mettiPlay(self.restartPoint);
            }
        });
        this.shadowRoot.getElementById('btn-np-pause').addEventListener('click', function(){
            self.paused = true;
            self.restartPoint = self.playHeadSamples;
            self.stop();
        });
        this.shadowRoot.getElementById('btn-np-stop').addEventListener('click', function(){
            if(self.isPlaying){
                self.stop();
            }
            self.restartPoint = self.region.startSample;
        });
        
        this.shadowRoot.getElementById('btn-np-forward').addEventListener('click', function(){
            //console.log("FORWARD!")            
            self.paused = true;
            self.restartPoint = self.playHeadSamples;
            if(self.isPlaying) self.stop();
            self.restartPoint += self.totalSamples / 100;
            if(self.restartPoint >= self.region.endSample) self.restartPoint = self.region.startSample; 
        });
        this.shadowRoot.getElementById('btn-np-backward').addEventListener('click', function(){
            //console.log("BACK!")            
            self.paused = true;
            self.restartPoint = self.playHeadSamples;
            if(self.isPlaying) self.stop();
            self.restartPoint -= self.totalSamples / 100;
            if(self.restartPoint <= self.region.startSample) self.restartPoint = self.region.startSample;
        });
        this.shadowRoot.getElementById('btn-np-loop').addEventListener('click', function() {
            self.loop = this.checked;
            self.source.loop = self.loop;
        });
        this.shadowRoot.getElementById('btn-np-autoscroll').addEventListener('click', function() {
            self.autoscroll = this.checked;
            if(self.autoscroll == true){
                self.shadowRoot.getElementById('scrollSlider').style.display = "none";
                self.shadowRoot.getElementById('scroll-value').style.display = "none";
            }
            else {
                self.shadowRoot.getElementById('scrollSlider').style.display = "block";
                self.shadowRoot.getElementById('scroll-value').style.display = "block";
            }
        });
        this.shadowRoot.getElementById('zoomSlider').addEventListener('change', function() {
            self.zoom = this.value;
            
            if(self.externalJson == 'undefined' || self.externalJson == null) self.dataToDisplay = self.analyzeData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.resolution);
            else self.dataToDisplay = self.analyzeExternalData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.originalSpp);
           
            var label = self.shadow.getElementById("zoom-value");
            label.innerHTML = this.value + "%";
        });
        this.shadowRoot.getElementById('zoomSlider').addEventListener("dblclick", function(){  
            this.value = this.defaultValue;
            self.zoom = this.value;
            if(self.externalJson == 'undefined' || self.externalJson == null) self.dataToDisplay = self.analyzeData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.resolution);
            else self.dataToDisplay = self.analyzeExternalData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.originalSpp);
           
            var label = self.shadow.getElementById("zoom-value");
            label.innerHTML = this.value + "%";
        });
        this.shadowRoot.getElementById('scrollSlider').addEventListener('change', function() {
            self.scroll = this.value;
            var label = self.shadow.getElementById("scroll-value");
            label.innerHTML = this.value + "%";
            if(self.externalJson == 'undefined' || self.externalJson == null) self.dataToDisplay = self.analyzeData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.resolution);
            else self.dataToDisplay = self.analyzeExternalData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.originalSpp);
           
        });
        this.shadowRoot.getElementById('scrollSlider').addEventListener('dblclick', function() {
            this.value = this.defaultValue;
            self.scroll = this.value;
            var label = self.shadow.getElementById("scroll-value");
            label.innerHTML = this.value + "%";
            if(self.externalJson == 'undefined' || self.externalJson == null) self.dataToDisplay = self.analyzeData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.resolution);
            else self.dataToDisplay = self.analyzeExternalData(self.bufferData, self.zoom, self.scroll, Number(self.canvas.waveWidth).toFixed(0), self.originalSpp);
           
        });
        this.shadowRoot.getElementById('rotation').addEventListener('change', function() {
            if(self.encoding === "B-Format"){
                this.newRot = multitrackPlayer.map_range(this.value, 0, 1, 0, 360);
                self.sceneRotator.yaw = this.newRot;
                self.sceneRotator.updateRotMtx();
            }
            else if (self.encoding === "MS"){
                this.newPan = multitrackPlayer.map_range(this.value, 0, 1, 2, 0);
                self.sides[0].gain.setValueAtTime(1 + (1 - this.newPan), self.audioContext.currentTime);
                self.sides[1].gain.setValueAtTime(1 + (1 - this.newPan), self.audioContext.currentTime);
                self.phaseInversion.gain.setValueAtTime(this.newPan - 1, self.audioContext.currentTime);
            }
            else if (self.encoding === "MONO"){
                this.newPan = multitrackPlayer.map_range(this.value, 0, 1, -1, 1);
                self.gainL.gain.setValueAtTime(1 - this.value, self.audioContext.currentTime);
                self.gainR.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            }
        });
        this.shadowRoot.getElementById('rotation').addEventListener('dblclick', function() {
            this.value = this.defaultValue;
            if(self.encoding === "B-Format"){
                this.newRot = multitrackPlayer.map_range(this.value, 0, 1, 0, 360);
                self.sceneRotator.yaw = this.newRot;
                self.sceneRotator.updateRotMtx();
            }
            else if (self.encoding === "MS"){
                this.newPan = multitrackPlayer.map_range(this.value, 0, 1, 2, 0);
                self.sides[0].gain.setValueAtTime(1 + (1 - this.newPan), self.audioContext.currentTime);
                self.sides[1].gain.setValueAtTime(1 + (1 - this.newPan), self.audioContext.currentTime);
                self.phaseInversion.gain.setValueAtTime(this.newPan - 1, self.audioContext.currentTime);
            }
            else if (self.encoding === "MONO"){
                this.newPan = multitrackPlayer.map_range(this.value, 0, 1, -1, 1);
                self.gainL.gain.setValueAtTime(1 - this.value, self.audioContext.currentTime);
                self.gainR.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            }
        });
        this.shadowRoot.getElementById('volumeSlider').addEventListener('change', function() {
            self.gain.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("volume-value");
            label.innerHTML = (10 * Math.log10(this.value)).toFixed(1) + "dB";
        });
        this.shadowRoot.getElementById('volumeSlider').addEventListener('dblclick', function() {
            this.value = this.defaultValue;
            self.gain.gain.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("volume-value");
            label.innerHTML = (10 * Math.log10(this.value)).toFixed(1) + "dB";
        });
        this.shadowRoot.getElementById('lp').addEventListener('change', function() {
            self.lp.frequency.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("lp-value");
            label.innerHTML = this.value + "Hz";
        });
        this.shadowRoot.getElementById('lp').addEventListener('dblclick', function() {
            this.value = this.defaultValue;
            self.lp.frequency.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("lp-value");
            label.innerHTML = this.value + "Hz";
        });
        this.shadowRoot.getElementById('hp').addEventListener('change', function() {
            self.hp.frequency.setValueAtTime(this.value, self.audioContext.currentTime);
            var label = self.shadow.getElementById("hp-value");
            label.innerHTML = this.value + "Hz";
        });
        this.shadowRoot.getElementById('hp').addEventListener('dblclick', function() {
            this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('preGainSlider').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('threshold').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('ratio').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('attack').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('release').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('lim_threshold').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('lim_attack').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
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
            this.shadowRoot.getElementById('lim_release').addEventListener('dblclick', function() {
                this.value = this.defaultValue;
                self.limiterParameters.release = this.value;
                var n =  self.audioContext.currentTime;
                for(var c = 0; c < self.limiter.length; c++){
                    self.limiter[c].release.setValueAtTime(this.value, n);
                }
                var label = self.shadow.getElementById("lim_release-value");
                label.innerHTML = this.value + "ms";
            });
        }
        this.shadow.getElementById("ui").addEventListener('mousedown', function(e){
            var bound = this.getBoundingClientRect();
            var x = e.clientX - bound.left;
            if(self.isPlaying) self.stop();
            self.clicking = true;
            self.xInterction = x;
            //self.restartPoint = self.playHeadSamples;

            let startPx = self.sampleToPx(self.region.startSample);
            let endPx = self.sampleToPx(self.region.endSample);
            
            let startPosition = startPx == true ? self.canvas.waveWidth + 20 : startPx == false ? -20 : Number(startPx);
            let endPosition = endPx == true ? self.canvas.waveWidth + 20 : endPx == false ? - 20 : Number(endPx);
            var distPx = Number(endPosition - startPosition);

            if(Math.abs(x - startPosition) < distPx * 0.2){
                //console.log("move start");
                self.moveStart = true;
                self.moveEnd = false;
                self.drag = false;
            }
            else if (Math.abs(endPosition - x) < distPx * 0.2){
                //console.log("move end")
                self.moveStart = false;
                self.moveEnd = true;
                self.drag = false;
            }
            else if(x > startPosition + (distPx * 0.2) && x < endPosition - (distPx * 0.2)){
                //console.log("drag");
                self.moveStart = false;
                self.moveEnd = false;
                self.drag = true;
                self.offSamples = self.pxToSample(x) - self.region.startSample;
                self.durationSamples = self.region.endSample - self.region.startSample;
            }
        })
        this.shadow.getElementById("box-np-main").addEventListener('mousemove', function(e){
            if(self.clicking == true){
                self.interaction = true;
                var bound = this.getBoundingClientRect();
                var uiBound = self.shadow.getElementById("ui").getBoundingClientRect();
                var x = e.clientX - uiBound.left;     
                if(self.moveStart){
                    //console.log("move start");
                    self.updateBounds(multitrackPlayer.clamp(self.pxToSample(x), 0, self.region.endSample - (self.samplesMaxZoom * 0.05)), self.region.endSample);
                }
                
                else if (self.moveEnd){
                    //console.log("move end")
                    self.updateBounds(self.region.startSample, multitrackPlayer.clamp(self.pxToSample(x), self.region.startSample + (self.samplesMaxZoom * 0.05), self.totalSamples));
                }
                else if (self.drag){
                    //console.log("drag");
                    let xSample = self.pxToSample(x);
                    self.updateBounds(multitrackPlayer.clamp(xSample - self.offSamples, 0, self.totalSamples - self.durationSamples - 1), multitrackPlayer.clamp(self.durationSamples + xSample - self.offSamples, self.durationSamples, self.totalSamples - 1));
                }
            }
        })
        this.shadow.getElementById("box-np-main").addEventListener('mouseup', function(e){
            if(self.clicking == true){
                if(self.interaction == true){
                    if(self.restartPoint < self.region.startSample || self.restartPoint >= self.region.endSample){
                        self.restartPoint = self.region.startSample;
                    } 
                }
                else{
                    self.restartPoint = self.pxToSample(self.xInterction);
                }
                self.clicking = false;
                self.interaction = false;
                self.xInterction = null;

                self.moveStart = false;
                self.moveEnd = false; 
                self.drag = false;
            }
            //console.log("restartPoint: " + self.restartPoint);
        })

        document.addEventListener('keyup', multitrackPlayer.shortcutHandler, false);
   
        
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
    //SHORTCUTS
    static shortcutHandler(e){
        var key = e.which || e.keyCode;
        if (key == 32){     //SPACEBAR
            if(self.isPlaying) self.shadowRoot.getElementById('btn-np-pause').click();
            else self.shadowRoot.getElementById('btn-np-play').click();
        }
        else if (key == 37){    //LEFT ARROW
            self.shadowRoot.getElementById('btn-np-backward').click();
        } 
        else if (key == 39){    //RIGHT ARROW
            self.shadowRoot.getElementById('btn-np-forward').click();
        };
    }
}

window.customElements.define("multitrack-player", multitrackPlayer);