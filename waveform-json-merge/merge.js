function mergeWaveforms(jsons){
    let output = {};
    output.channels = jsons.length;
    output.samples_per_pixel = jsons[0].samples_per_pixel
    output.data = new Array(output.channels);
    for(let i = 0; i < output.channels; i++){
        console.log(jsons[i].data);
        output.data[i] = jsons[i].data;
    }
    return output;
}

const fs = require('fs');
const path = require('path');

function init(dir) {
  return fs.readdirSync(dir)
           .filter(name => path.extname(name) === '.json')
           .map(name => require(path.join(dir, name)));
}

const data = init('../assets/pre/')
let out = JSON.stringify(mergeWaveforms(data), "", 2);
fs.writeFile('../assets/post/merged.json', out , 'utf8', function(){});