module objects {
    /* 
Keyboard Controls
Source file	name:       keyboardcontrols.ts
Author’s name:	        George Savcheko and Jason Gunter
Last modified by:       Jason Gunter
Date last modified:     2016-03-16
Program	description:    Create your own simple First Person Perspective game. The game must include hazards for the player to avoid. A scoring
                        system must also be included. You must build your own graphic and sound assets. You must use ThreeJS and a JavaScript 
                        Physics Engine to build your game. 
Revision history:       added comments and some keyboard functionality
THREEJS Aliases
*/
    // MouseControls Class +++++++++++++++
    export class MouseControls {
        // PUBLIC INSTANCE VARIABLES +++++++++
        public sensitivity: number;
        public yaw: number; // look left and right - y-axis
        public pitch: number; // look up and down - x-axis
        public enabled: boolean;
        // CONSTRUCTOR +++++++++++++++++++++++
        constructor() {
            this.enabled = false;
            this.sensitivity = 0.1;
            this.yaw = 0;
            this.pitch = 0;
            
            document.addEventListener('mousemove', this.OnMouseMove.bind(this), false);
        }
        
        // PUBLIC METHODS +++++++++++++++++++++
        public OnMouseMove(event: MouseEvent):void {
            this.yaw = -event.movementX * this.sensitivity;
            
            this.pitch = -event.movementY * this.sensitivity * 0.1;
        }
    }
}