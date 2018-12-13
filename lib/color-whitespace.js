'use babel';
 
import ColorWhitespaceView from './color-whitespace-view';
import { CompositeDisposable } from 'atom';
 
export default {
  isColor:null,
  skipColor:false,
  colorWhitespaceView: null,
  footerPanel: null,
  subscriptions: null,
  styles:[{name:"if"}, {name:"altif"},{name:"loop"}, {name:"class"}, {name:"function"}, {name:"try"}, {name:"catch"}, {name:"unknown"}],
  config:{
    transp:{
      order: 1,
      type: 'number',
      default: 0.3,
      minimum: 0.0,
      maximum: 1.0,
      title: 'opacity',
      description: 'This will change opacity of rectangles. set it to 1 to get fully colored rectangles',
    },
    
    roundcorner:{
      order: 2,
      type: 'integer',
      default: 3,
      minimum: 0,
      maximum: 10,
      title: 'rectangle round corner',
      description: 'This will change roundiness of rectangle. set it to 0 to get pure rectangles',
    },
    
    ifcol:{
      order: 3,
      type: 'color',
      title: 'if block color',
      description: 'This will change the colored rectangles for if blocks',
      default: "#8F8",
    },
    altifcol:{
      order: 4,
      type: 'color',
      title: 'alternate if(else) block color',
      description: 'This will change the colored rectangles for alternate if(else, case%2==1) blocks',
      default: "#F00",
    },
    loopcol:{
      order: 5,
      type: 'color',
      title: 'loop(for, while) block color',
      description: 'This will change the colored rectangles for loop blocks',
      default: "#88f",
    },
    classcol:{
      order: 6,
      type: 'color',
      title: 'class/object block color',
      description: 'This will change the colored rectangles for class/object blocks',
      default: "#666",
    },
    functioncol:{
      order: 7,
      type: 'color',
      title: 'function/method block color',
      description: 'This will change the colored rectangles for function/method blocks',
      default: "#AAA",
    },
    trycol:{
      order: 8,
      type: 'color',
      title: 'try block color',
      description: 'This will change the colored rectangles for try blocks',
      default: "#ff0",
    },
    catchcol:{
      order: 9,
      type: 'color',
      title: 'catch block color',
      description: 'This will change the colored rectangles for catch blocks',
      default: "#f80",
    },
    unknowncol:{
      order: 10,
      type: 'color',
      title: 'unknown block color',
      description: 'This will change the colored rectangles for unknown blocks',
      default: "#000",
    }
   },

  clear(editor){
    this.isColor = false;
     
    if (editor.allColorWhitespaceMarkers && editor.allColorWhitespaceMarkers.length>0)
      for (m in editor.allColorWhitespaceMarkers)
        editor.allColorWhitespaceMarkers[m].destroy()
  },
   
   
  /*
    ██████  ██████  ██       ██████  ██████  ██ ███████ ███████
   ██      ██    ██ ██      ██    ██ ██   ██ ██    ███  ██
   ██      ██    ██ ██      ██    ██ ██████  ██   ███   █████
   ██      ██    ██ ██      ██    ██ ██   ██ ██  ███    ██
    ██████  ██████  ███████  ██████  ██   ██ ██ ███████ ███████
  */
  colorize(editor){
    if (editor){
      //console.log("  colorize "+editor.buffer.file.path);
    }else {
      console.log(editor);
      return;
    }
     
    if (editor.colorWhitespaceTimeout)
      clearTimeout(editor.colorWhitespaceTimeout)
    editor.colorWhitespaceTimeout = 0;
    let element = atom.views.getView(editor)
     
    if (editor.allColorWhitespaceMarkers && editor.allColorWhitespaceMarkers.length>0)
      for (m in editor.allColorWhitespaceMarkers)
        editor.allColorWhitespaceMarkers[m].destroy()
    else
      editor.allColorWhitespaceMarkers = []
       
    let lang = editor.getRootScopeDescriptor();
    let tab = atom.config.get('editor.tabLength', [lang])
     
    let cursorPosition = editor.getCursorBufferPosition()
    let sels = editor.getSelectedScreenRanges()
    let toplines = [];
     
    //let fl = editor.element.getFirstVisibleScreenRow();
    //let ll = editor.element.getLastVisibleScreenRow();
    let fl = 0;
    let ll = editor.getLineCount()-1;
    let firstline = editor.lineTextForScreenRow(fl);
    
    let prevline = 0;
    let lastValidLine = 0;
    let h=-1;
    let w=-1;
    let cssText = '';
    for (let j=fl; j<=ll; j++){
      //console.log(j+"::"+prevline)
      //editor.setIndentationForBufferRow(j, editor.indentationForBufferRow(j))
      let line = editor.lineTextForScreenRow(j);
      let rlimit;
      for (rlimit=0; rlimit<line.length && (line[rlimit]==" " || line[rlimit]=="\t"); rlimit++){
       
      }
       
      if (rlimit<prevline && rlimit==line.length){
        for (let i=rlimit+1; i<prevline; i++){
          editor.setCursorBufferPosition([j, i])
          //console.log("   INSERT SPACE @"+i+","+j+" "+rlimit+"..."+prevline)
          editor.insertText(" ");
          //editor.setTextInBufferRange(new Range([j, i], [j, i]), " ")
        }
        rlimit = prevline;
      } else {
        let s = line.replace(/[\{\}\t ]+/g, '');
        let regexfunc = /.*[a-zA-Z_][a-zA-Z0-9_]*\(.*\)/g
        s = s.replace(/\/\/.*/g, ''); //remove comments
        s = s.replace(/(\/\*.*\*\/)+/g, ''); //remove comments
        if (s.indexOf("switch")==0)
          swcase=0;
        toplines[rlimit+1] = {type:"unknown", indentor:s, indentstart:rlimit, indentstop:-1, row:j, rowend:line.length, count:0, count2:0, count3:0, count4:0};
        if (s.indexOf("if")==0)
          toplines[rlimit+1].type = "if";
        else if (s.indexOf("else")==0)
          toplines[rlimit+1].type = "altif";
        else if (s.indexOf("elseif")==0 || s.indexOf("elsif")==0)
           toplines[rlimit+1].type = "iforaltif";
        else if (s.indexOf("switch")==0)
          toplines[rlimit+1].type = "iforaltif";
        else if (s.indexOf("case")==0)
          toplines[rlimit+1].type = "iforaltifprev";
        else if (s.indexOf("for")==0 || s.indexOf("do")==0 || s.indexOf("while")==0)
            toplines[rlimit+1].type = "loop";
        else if (s.indexOf("class")==0)
          toplines[rlimit+1].type = "class";
        else if (s.indexOf("try")==0)
          toplines[rlimit+1].type = "try";
        else if (s.indexOf("catch")==0)
          toplines[rlimit+1].type = "catch";
        else if (s.indexOf("function")==0 || s.indexOf("=function(")>=0 || line.search(regexfunc)==0)
          toplines[rlimit+1].type = "function";
           
        for (let i=rlimit+2; i<=lastValidLine; i++)
          if (toplines[i])
            toplines[i]=undefined;
        lastValidLine = rlimit+1;
        //console.log((j+1)+": "+rlimit+" => "+s);
      }
       
      for (i=1; i<rlimit; i+=tab){
        let marker = editor.markBufferRange({start:{row:j, column:i}, end:{row:j, column:i+1}}, {invalidate:"touch"})
        editor.allColorWhitespaceMarkers.push(marker)
         
        if (h==-1 || w==-1) {
          h = editor.getLineHeightInPixels();
          if (h==null) {
            console.log(editor)
            console.log("h="+h)
            console.log(marker)
            return
          }
          w = element.pixelPositionForScreenPosition(marker.getScreenRange().end).left-
              element.pixelPositionForScreenPosition(marker.getScreenRange().start).left;
          //console.log(w)
          cssText = 'width: '+w+'px; height: '+h+'px; transform: translate(-'+w+'px,-'+h+'px);';
        }
         
        if (!toplines[i] || i>lastValidLine) continue;
        toplines[i].count++;
        if (i>=tab && toplines[i-tab]) toplines[i-tab].count3++;
        if (i==rlimit-1){
          toplines[i].count2++;
          if (i>=tab && toplines[i-tab]) toplines[i-tab].count3++;
        }
        
        // alternate colors
        if (toplines[i].type=="iforaltif"){
          if (toplines[i].count2%2==1)
            decoration = editor.decorateMarker(marker, {type: 'highlight', class: 'boxer div-if'})
          else
            decoration = editor.decorateMarker(marker, {type: 'highlight', class: 'boxer div-altif'})
        } else if (toplines[i].type=="iforaltifprev"){
          if (toplines[i-tab].count2%2==1)
            decoration = editor.decorateMarker(marker, {type: 'highlight', class: 'boxer div-if'})
          else
            decoration = editor.decorateMarker(marker, {type: 'highlight', class: 'boxer div-altif'})
        } else
          decoration = editor.decorateMarker(marker, {type: 'highlight', class: 'boxer div-'+toplines[i].type+''})
           
        if (cursorPosition.column>=i && cursorPosition.column<=i+1 && cursorPosition.row==j){
          let marker2 = editor.markBufferRange({start:{row:toplines[i].row, column:toplines[i].indentstart},
                                                  end:{row:toplines[i].row, column:toplines[i].rowend}}, {invalidate:"touch"})
          decoration = editor.decorateMarker(marker2, {type: 'highlight', class: 'boxer div-'+toplines[i].type+' blink_me'})
          //console.log(decoration)
          editor.allColorWhitespaceMarkers.push(marker2)
        }
         
      }
      prevline = i;
    }
    editor.setCursorBufferPosition(cursorPosition)
    editor.setSelectedScreenRanges(sels)
     
    editor.colorWhitespaceTimeout = undefined;
    //console.log("  colorize done "+editor.buffer.file.path);
  },
   
   
  /*
  please consider copy this in the final module package.json so it's not loaded by default
  but for debugging purpose it's easier without it
  "activationCommands": {
    "atom-workspace": "color-whitespace:toggle"
  },
  ███████ ███████ ████████ ███████ ████████ ██    ██ ██      ███████
  ██      ██         ██    ██         ██     ██  ██  ██      ██
  ███████ █████      ██    ███████    ██      ████   ██      █████
       ██ ██         ██         ██    ██       ██    ██      ██
  ███████ ███████    ██    ███████    ██       ██    ███████ ███████
*/
  setStyle(style){
    //console.log(' setStyle:'+ style)
     
    let transp = atom.config.get('color-whitespace.transp')
    let transp1 = Math.min (1.0, transp+0.0);
    let transp2 = transp/2.0;
     
    if (!style){
      let roundcorner = atom.config.get('color-whitespace.roundcorner')
      let style0 = document.getElementById('style0')
      if (!style0)
        style0 = document.createElement('style')
         
      style0.id = 'style0';
      style0.innerHTML = ".boxer .boxer{\n\
          border-radius: "+roundcorner+"px;\n\
          border-left:   1px solid rgba(255,255,255,0.25);\n\
          border-top:    1px solid rgba(255,255,255,0.25);\n\
          border-right:  1px solid rgba(0,0,0,0.25);\n\
          border-bottom: 1px solid rgba(0,0,0,0.25);\n\
        }\
      "
      document.head.appendChild(style0);
      return;
    }
    let col = atom.config.get('color-whitespace.'+style.name+'col')
     
    if (style.css)
      document.head.removeChild(style.css);
    style.css = document.createElement('style')
    style.css.innerHTML = ".div-"+style.name+" {\n\
      background-image: linear-gradient(to bottom right, rgba("+col._red+","+col._green+","+col._blue+","+transp1+"), rgba("+col._red+","+col._green+","+col._blue+","+transp2+"));\n\
    }\n\
    .div-"+style.name+".reverse {\n\
      background-image: linear-gradient(to top left, rgba("+col._red+","+col._green+","+col._blue+","+transp1+"), rgba("+col._red+","+col._green+","+col._blue+","+transp2+"));\n\
    }"
    document.head.appendChild(style.css);
  },
   
  register(){
    //console.log("register: "+this.isColor);
     
    if (this.isColor===null){
      //console.log("register!");
      let me=this;
       
      for (i in this.styles){
        //this.setStyle(this.styles[i]);
        let s = this.styles[i];
        this.subscriptions.add(atom.config.observe('color-whitespace.'+s.name+'col', function(newValue){
          //console.log( s.name+' configuration changed:'+ newValue)
          me.setStyle(s)
        }));
      }
      this.subscriptions.add(atom.config.observe('color-whitespace.transp', function(newValue){
        //console.log('color-whitespace.transp configuration changed:'+ newValue)
        for (i in me.styles){
          let s = me.styles[i];
          me.setStyle(s)
        }
      }));
      this.subscriptions.add(atom.config.observe('color-whitespace.roundcorner', function(newValue){
        //console.log('color-whitespace.roundcorner configuration changed:'+ newValue)
        me.setStyle()
      }));
       
      this.subscriptions.add(atom.workspace.observeTextEditors(function(editor){
        // works better than registering onDidStopChanging()
        if (editor.buffer.file){
          
          let watcher = function(e){
            if(!me.skipcolor){
            //console.log("  watch change in "+editor.buffer.file.path+" "+editor.colorWhitespaceTimeout);
            if (editor.colorWhitespaceTimeout)
              clearTimeout(editor.colorWhitespaceTimeout)
            if (editor.colorWhitespaceTimeout!=0)
              editor.colorWhitespaceTimeout = setTimeout(function(){
                if (me.isColor && !me.skipcolor===true){
                  //if (editor.getBuffer().dis1) {editor.getBuffer().dis1.dispose();console.log("unsuscribe1");}
                  //if (editor.dis2) {editor.dis2.dispose();console.log("unsuscribe1");}
                  //console.log("colorize");
                  me.skipcolor = true;
                  me.colorize(editor);
                  me.skipcolor = false;
                   
                  //console.log("colorize done ");
                  //me.isColor = false;
                  //editor.getBuffer().dis1 = editor.getBuffer().onDidStopChanging(watcher)
                  //editor.dis2 = editor.onDidChangeCursorPosition(watcher)
                   
                   
                }
              }, 300);
            } else if (me.skipcolor){
             
            }
          }
          me.subscriptions.add(editor.getBuffer().onDidChange(watcher))
          me.subscriptions.add(editor.onDidChangeCursorPosition(watcher))
        }
         
      }))
    }
    this.isColor = true;
  },

    /*
   █████   ██████ ████████ ██ ██    ██  █████  ████████ ███████
  ██   ██ ██         ██    ██ ██    ██ ██   ██    ██    ██
  ███████ ██         ██    ██ ██    ██ ███████    ██    █████
  ██   ██ ██         ██    ██  ██  ██  ██   ██    ██    ██
  ██   ██  ██████    ██    ██   ████   ██   ██    ██    ███████
  */
  activate(state) {
    //console.log("activate "+this.isColor+" ");
     
    this.colorWhitespaceView = new ColorWhitespaceView(state.colorWhitespaceViewState);
    this.footerPanel = atom.workspace.addFooterPanel({
      item: this.colorWhitespaceView.getElement(),
      visible: true,
      priority:0
    });
     
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
     
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'color-whitespace:toggle': () => this.toggle()
    }));
    this.register();
  },
   
  deactivate() {
    this.footerPanel.destroy();
    this.subscriptions.dispose();
    this.colorWhitespaceView.destroy();
  },
   
  serialize() {
    return {
      colorWhitespaceViewState: this.colorWhitespaceView.serialize()
    };
  },
   
  toggle() {
    return (
      this.footerPanel.isVisible() ?
      this.footerPanel.hide() :
      this.footerPanel.show()
    );
  }
   
};
 
