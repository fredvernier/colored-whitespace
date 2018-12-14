'use babel';
 
import ColorWhitespace from './color-whitespace';
 
export default class ColorWhitespaceView {
 
  constructor(serializedState) {
    //console.log("create ColorWhitespaceView")
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('color-whitespace');
     
    // Create elements
    const message = document.createElement('span');
    const button0 = document.createElement('button');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    message.textContent = 'ColorWhitespace: ';
    button0.textContent = ' Close ';
    button1.textContent = ' Colorize ';
    button2.textContent = ' Clear ';
    button0.onclick=function(){
      ColorWhitespace.toggle();
    }
    button1.onclick=function(){
      const editor = atom.workspace.getActiveTextEditor()
      ColorWhitespace.safeColorize(editor)
    }
    button2.onclick=function(){
      const editor = atom.workspace.getActiveTextEditor()
      ColorWhitespace.clear(editor)
    }
    button0.classList.add('fredbutton');
    button1.classList.add('fredbutton');
    button2.classList.add('fredbutton');
    message.classList.add('fredmessage');
     
    this.element.appendChild(message);
    this.element.appendChild(button0);
    this.element.appendChild(button1);
    this.element.appendChild(button2);
  }
   
  // Returns an object that can be retrieved when package is activated
  serialize() {}
   
  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }
   
  getElement() {
    return this.element;
  }
   
}
 
