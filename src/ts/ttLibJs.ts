import * as abg from "./audio/beepGenerator";
import * as abp from "./audio/bufferPlayer";
import * as asp from "./audio/scriptPlayer";
import * as vsc from "./video/sceneCapture";
import * as vsd from "./video/sceneDrawer";

export namespace audio {
  export class BeepGenerator extends abg.BeepGenerator{}
  export class BufferPlayer extends abp.BufferPlayer{}
  export class ScriptPlayer extends asp.ScriptPlayer{}
}
export namespace video {
  export class SceneCapture extends vsc.SceneCapture{}
  export class SceneDrawer extends vsd.SceneDrawer{}
}
export class BeepGenerator extends abg.BeepGenerator{}
export class BufferPlayer extends abp.BufferPlayer{}
export class ScriptPlayer extends asp.ScriptPlayer{}
export class SceneCapture extends vsc.SceneCapture{}
export class SceneDrawer extends vsd.SceneDrawer{}
