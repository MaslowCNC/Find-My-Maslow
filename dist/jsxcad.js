import { askService, askServices, createService, touch, setupFilesystem, listFiles } from './jsxcad-sys.js';
import { buildMeshes, orbitDisplay } from './jsxcad-ui-threejs.js';

//Setup worker
const agent = async ({ ask, question }) => {
  if (question.ask) {
    const { identifier, options } = question.ask;
    return askSys(identifier, options);
  }else if (question.touchFile) {
    const { path, workspace } = question.touchFile;
    await touch(path, { workspace });
    // Invalidate the path in all workers.
    await askServices({ touchFile: { path, workspace } });
  }
};

var serviceSpec = {};

if(window.location.href.includes('run')){
    serviceSpec = {
      webWorker: '../maslowWorker.js',  //'../maslowWorker.js', fixes this for run mode
      agent,
      workerType: 'module',
    };
}
else{
    serviceSpec = {
      webWorker: './maslowWorker.js',  //'../maslowWorker.js', fixes this for run mode
      agent,
      workerType: 'module',
    };
}

window.ask = (question) => {
    const result = askService(serviceSpec, question);
    return result;
};


//Add 3d view //With axis does not work right now. Needs to be changed in jsxcad-ui-threejs
orbitDisplay({view: {fit: false}, withAxes: true, withGrid: true, gridLayer: 0}, document.getElementById('viewerContext')).then(result=>{
    window.updateDisplay = result.updateGeometry
});

setupFilesystem({ fileBase: 'maslow' });

//Test some things
console.log("Here we are going to run two tasks at the same time in different workers");
console.log("The first task is generating threejsGeometry from a complex shape which will take some time. Nothing is done with the generated geometry.");
console.log("The second task is creating a rectangle and writing it to a path which should be quite quick");
console.log("We would expect the second worker to finish first because it has less to do, but somehow it is blocked by the first worker");

window.ask({key: "display"});
window.ask({key: "rectangle", x:5, y:5, writePath: "atomGeometry/test" });

//If there is anything queued up to be called back when the ask worker is operational 
if(window.askSetupCallback){
    window.askSetupCallback();
}


//TODo: Add some garbage collection here which checks when a path was last written to or read from and deletes the old ones. Probably will require a wrapper for reading and writing to paths
// listFiles().then(result => {
    // console.log(result);
// })
