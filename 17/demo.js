window.onload = function() {

  // create and initialize a 3D renderer
  var r = new X.renderer3D();
  r.bgColor = [.1, .1, .1];
  r.init();
  
  // create a X.volume
  volume = new X.volume();
  // .. and attach a volume
  volume.file = 'http://x.babymri.org/?lesson17.nii.gz';

  // only add the volume for now, the mesh gets loaded on request
  r.add(volume);
  

  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  r.onShowtime = function() {

    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';

     // Hide Y and Z slices
    volume.children[1]['visible'] = false;
    volume.children[2]['visible'] = false;
    
    // Global vars
    r.coloring = true;
    r.color = [1, 1, 1];
    volume.xColor = r.color;

    r.rebuildNavWidget = function(){
      if(typeof navgui != 'undefined'){
        if (typeof sliceXController != 'undefined'){
          navgui.remove(sliceXController);
        }
        sliceXController = navgui.add(volume, 'indexX', 0,volume.range[0] - 1).name('Slice Index').listen();
        navgui.open();

        // Callbacks
        sliceXController.onChange(function(value){
          // Hide Y and Z slices
          volume.children[1]['visible'] = false;
          volume.children[2]['visible'] = false;
        });
      };
    };

    // set callback to change X slice normal
    var demoIntervalID = setInterval(function(){
      var time = new Date().getTime() * 0.002;
      volume.xNormX = Math.cos(time);
      volume.xNormY = Math.cos(time/2);
      volume.xNormZ = Math.cos(time/3);
      r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
      if(r.coloring){
        volume.xColor = r.color;
        volume.maxColor = volume.xColor;
      }
      volume.sliceInfoChanged(0);
      r.rebuildNavWidget();},100);

    // CREATE Bounding Box
    var res = [volume.bbox[0],volume.bbox[2],volume.bbox[4]];
    var res2 = [volume.bbox[1],volume.bbox[3],volume.bbox[5]];

    box = new X.object();
    // box.color = [0, 157, 233];

    box.points = new X.triplets(72);
    box.normals = new X.triplets(72);
    box.type = 'LINES';
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res2[0], res[1], res[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res2[0], res[1], res[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res2[0], res[1], res[2]);
    for ( var i = 0; i < 24; ++i) {
      box.normals.add(0, 0, 0);
    }
    r.add(box);

    var center = [volume.bbox[0] + (volume.bbox[1]-volume.bbox[0]),
              volume.bbox[2] + (volume.bbox[3]-volume.bbox[2]),
              volume.bbox[4] + (volume.bbox[5]-volume.bbox[4])
              ]

    //
    // The GUI panel
    //
    // (we need to create this during onShowtime(..) since we do not know the
    // volume dimensions before the loading was completed)
    
    this.mode = 0;
    this.bbox = true;
    
    // set xNorms to 1.0 to avoid sliceGUI bug
    volume.xNormX = 1.0;
    volume.xNormY = 1.0;
    volume.xNormZ = 1.0;


    var gui = new dat.GUI();
    // create the UI controller
    modegui = gui.addFolder('General');
    var sliceMode = modegui.add(this, 'mode', { 'Demo':0, 'Navigation':1, 'Manual':2 } ).name('Interaction Mode');
    var bboxMode = modegui.add(this, 'bbox').name('Show BBox');
    var coloringMode = modegui.add(this, 'coloring').name('Slice Coloring');
    modegui.open();

    slicegui = gui.addFolder('Slice Information');
    var sliceXNXController = slicegui.add(volume, 'xNormX', -1,1).name('Normal X Dir.').listen();
    var sliceXNYController = slicegui.add(volume, 'xNormY', -1,1).name('Normal Y Dir.').listen();
    var sliceXNZController = slicegui.add(volume, 'xNormZ', -1,1).name('Normal Z Dir.').listen();
    var sliceXNCController = slicegui.addColor(r, 'color').name('Color').listen();
    slicegui.open();

    navgui = gui.addFolder('Slice Navigation');
    r.rebuildNavWidget();

    // callbacks
    sliceMode.onChange(function(value) {

      if (value == 0) {
        // cleanup navigation
        if (typeof updateViewNavigation != 'undefined'){
          r.interactor.removeEventListener(  X.event.events.ROTATE, updateViewNavigation);
        }

        // setup demo
        var _this = this;
        demoIntervalID = setInterval(function(){
          var time = new Date().getTime() * 0.002;
          volume.xNormX = Math.cos(time);
          volume.xNormY = Math.cos(time/2);
          volume.xNormZ = Math.cos(time/3);
          r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
          if(r.coloring){
            volume.xColor = r.color;
            volume.maxColor = volume.xColor;
          }
          volume.sliceInfoChanged(0);
          r.rebuildNavWidget();},100); 
      }
      else if (value == 1){
        // cleanup demo
        clearInterval(demoIntervalID);

        // setup navigation
        updateViewNavigation = function(){
          var _x = r.camera.view[2];
          var _y = r.camera.view[6];
          var _z = r.camera.view[10];
          // normalize 
          var length = Math.sqrt(_x*_x + _y*_y+_z*_z);

          volume.xNormX = _x/length;
          volume.xNormY = _y/length;
          volume.xNormZ = _z/length;
          r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
          if(r.coloring){
            volume.xColor = r.color;
            volume.maxColor = volume.xColor;
          }
          volume.sliceInfoChanged(0);

          //rebuild Slice navigation
          r.rebuildNavWidget();
        }


        r.interactor.addEventListener(  X.event.events.ROTATE, updateViewNavigation);

        updateViewNavigation();
      }
      else if (value == 2){
        // cleanup demo
        clearInterval(demoIntervalID);

        // cleanup navigation
        if (typeof updateViewNavigation != 'undefined'){
          r.interactor.removeEventListener(  X.event.events.ROTATE, updateViewNavigation);
        }
      }
    });

    bboxMode.onChange(function(value) {
      box.visible = value;
    });

    coloringMode.onChange(function(value) {
      if(value){
        volume.xColor = r.color;
        volume.maxColor = volume.xColor;
      }
      else{
        volume.xColor = [1, 1, 1];
        volume.maxColor = [1, 1, 1];
      }
      volume.sliceInfoChanged(0);
    });

    // slice callbacks
    sliceXNXController.onChange(function(value){
      r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
      if(r.coloring){
        volume.xColor = r.color;
        volume.maxColor = volume.xColor;
      }
      volume.sliceInfoChanged(0);
      r.rebuildNavWidget();
    });

    sliceXNYController.onChange(function(value){
      r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
      if(r.coloring){
        volume.xColor = r.color;
        volume.maxColor = volume.xColor;
      }
      volume.sliceInfoChanged(0);
      r.rebuildNavWidget();
    });

    sliceXNZController.onChange(function(value){
      r.color = [Math.abs(volume.xNormX), Math.abs(volume.xNormY), Math.abs(volume.xNormZ)];
      if(r.coloring){
        volume.xColor = r.color;
        volume.maxColor = volume.xColor;
      }
      volume.sliceInfoChanged(0);
      r.rebuildNavWidget();
    });

    sliceXNCController.onChange(function(value){
      if(this.coloring){
        volume.xColor = this.color;
        volume.sliceInfoChanged(0);
      }
    });
  };
  
  // adjust the camera position a little bit, just for visualization purposes
  r.camera.position = [270, 250, 330];
  
  r.render();

};
