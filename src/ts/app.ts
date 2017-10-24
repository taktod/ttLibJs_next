/// <reference types="@types/jquery" />
/// <reference types="@types/node" />
console.log("test");

// これで縮小名も、通常名も取得可能になった。とする。
import {tt} from "./../../"; // これをやると、index.tsではなく、index.js側が優先されるらしい・・・つかいにくいな・・・

$(function() {
  console.log("よし");
  // こうやって使える。
  // なるほどね。
  // とりあえず書いてみるか・・・
  // getUserMediaを利用してマイクデータをキャプチャして、webAudioで変換かけて、再生する。
  // 変換のところで音を歪ませてあそべるようにしておく。
  // が、今回の目的
  var constraint:MediaStreamConstraints = {};
  var ps = require("pitch-shift");
  constraint.video = true;
  constraint.audio = false;
  $("#start").on("click", () => {
    navigator.mediaDevices.getUserMedia(constraint)
    .then((stream:MediaStream) => {
      var original = document.getElementById("original") as HTMLVideoElement;
      original.srcObject = stream;
      original.play();

      var display = document.getElementById("display") as HTMLCanvasElement;
      var capture = new tt.SceneCapture(320, 240);
      var drawer = new tt.SceneDrawer(display);
      var yuv = new Uint8Array(320 * 240 * 3 / 2);
      var wh = 320 * 240;
      var draw = () => {
        capture.drain(original, yuv);
        drawer.draw(
          yuv.subarray(0, wh), 320,
          yuv.subarray(wh, wh + (wh >> 2)), 160,
          yuv.subarray(wh + (wh >> 2), wh + (wh >> 1)), 160);
        requestAnimationFrame(draw);
      };
      draw();
    });
  });
  /*
  // 以前つくったpitch-shiftの動作
  $("#start").on("click", () => {
    navigator.getUserMedia(constraint,
      (stream:MediaStream) => {
        console.log("getUserMediaできた。");
        console.log(stream);
        console.log(stream.getAudioTracks());
        console.log(stream.getVideoTracks());
        var context:AudioContext = new AudioContext();
        var node:MediaStreamAudioSourceNode = context.createMediaStreamSource(stream);
        / *
        var pitchShift = new tt.PitchShifterNode(
          context,
          1.2,
          0.5,
          1024);
        node.connect(pitchShift.refNode());
        pitchShift.refNode().connect(context.destination);
        * /
        var pitchShift2 = new tt.PitchShifterNode2(
          context,
          1.2,
          512);
        node.connect(pitchShift2.refNode());
        pitchShift2.refNode().connect(context.destination);
      },
      () => {
        console.log("getUserMediaできなかった。");
      }
    );
  });
  // */
});

