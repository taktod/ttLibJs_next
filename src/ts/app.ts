/// <reference types="@types/jquery" />
console.log("test");

// これで縮小名も、通常名も取得可能になった。とする。
import {tt} from "./../../"; // これをやると、index.tsではなく、index.js側が優先されるらしい・・・つかいにくいな・・・
// 仕方ないか・・・

$(function() {
  console.log("よし");
  // こうやって使える。
  // なるほどね。
  var bb = new tt.BeepGenerator(440, 48000, 2);
  bb.amplitude = 32765;
/*  var player:ttLibJs.audio.BufferPlayer = new tt.BufferPlayer();
  player.test();
  var p:ttLibJs.audio.BufferPlayer = new ttLibJs.audio.BufferPlayer();
  p.test();*/
});

