// webgl2を利用して動作するvideoやimage、canvasの内容をyuvに変換する動作

export class SceneCapture2 {
  private canvas:HTMLCanvasElement;
  private length:number;
  private captureTexture:WebGLTexture;
  private gl2:any;

  private vTransformFeedback:any;
  private transformFeedback:any;
  // 指定したサイズのyuvデータとして取得します
  constructor(width:number, height:number) {
    // 新規でcanvasを作成して、そこに出力をつくる
    this.canvas = document.createElement("canvas");
    // webgl2.0を使う
    this.gl2 = this.canvas.getContext("webgl2");
    if(!this.gl2) {
      throw new Error("webgl2.0 is not supported.");
    }
    var vsSrc = `#version 300 es
in float Position;
uniform int width;
uniform int height;
uniform sampler2D captureTex;

// 結果の応答を実施する動作 整数で返す(32bitみたい)
flat out int result;

// rgb -> yuvの変換で利用するvector
const vec4 colorConvY = vec4( 0.183, 0.614, 0.062, 0.0);
const vec4 colorConvU = vec4(-0.101,-0.339, 0.439, 0.0);
const vec4 colorConvV = vec4( 0.439,-0.399,-0.040, 0.0);

int test(vec4 colorConv, int index, int wid, int hei, float diff) {
  int w  = wid >> 2;
  int i = (index % w) << 2;
  int j = index / w;
  float xpos1 = float(i) / float(wid);
  float xpos2 = float(i + 1) / float(wid);
  float xpos3 = float(i + 2) / float(wid);
  float xpos4 = float(i + 3) / float(wid);
  float ypos  = float(j) / float(hei);
  mat4 color  = mat4(
    texture(captureTex, vec2(xpos1, ypos)),
    texture(captureTex, vec2(xpos2, ypos)),
    texture(captureTex, vec2(xpos3, ypos)),
    texture(captureTex, vec2(xpos4, ypos))
  );

  vec4 val = colorConv * color * 255.0 + vec4(diff);
  int ival1 = int(val.x);
  int ival2 = int(val.y) << 8;
  int ival3 = int(val.z) << 16;
  int ival4 = int(val.w) << 24;
  return ival4 | ival3 | ival2 | ival1;
}

void main() {
  int index = int(Position);
  int wh = width * height >> 2;
  if(index < wh) {
    result = test(colorConvY, index, width, height, 16.0);
  }
  else {
    index = index - wh;
    if(index < wh >> 2) {
      result = test(colorConvU, index, width >> 1, height >> 1, 128.0);
    }
    else {
      result = test(colorConvV, index - (wh >> 2), width >> 1, height >> 1, 128.0);
    }
  }
}
`;
    var fsSrc = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
  outColor = vec4(1.0);
}
`;
    // vertex shader
    var vs = this.gl2.createShader(this.gl2.VERTEX_SHADER);
    this.gl2.shaderSource(vs, vsSrc);
    this.gl2.compileShader(vs);
    if(!this.gl2.getShaderParameter(vs, this.gl2.COMPILE_STATUS)) {
      throw new Error("failed to make shader.");
    }
    // fragment shader
    var fs = this.gl2.createShader(this.gl2.FRAGMENT_SHADER);
    this.gl2.shaderSource(fs, fsSrc);
    this.gl2.compileShader(fs);
    if(!this.gl2.getShaderParameter(fs, this.gl2.COMPILE_STATUS)) {
      throw new Error("failed to make shader.");
    }
    // programつくる
    var program = this.gl2.createProgram();
    this.gl2.attachShader(program, vs);
    this.gl2.attachShader(program, fs);
    this.gl2.transformFeedbackVaryings(program, ["result"], this.gl2.SEPARATE_ATTRIBS);
    this.gl2.linkProgram(program);

    if(!this.gl2.getProgramParameter(program, this.gl2.LINK_STATUS)) {
      throw new Error("failed to make program.");
    }
    this.gl2.useProgram(program);

    // texture準備
    var dummyArray = new Uint8Array(width * height * 4);
    var captureTexLocation = this.gl2.getUniformLocation(program, 'captureTex');
    this.gl2.uniform1i(captureTexLocation, 0);
    this.gl2.activeTexture(this.gl2.TEXTURE0);
    this.captureTexture = this.gl2.createTexture();
    this.gl2.bindTexture(this.gl2.TEXTURE_2D, this.captureTexture);
    this.gl2.texParameteri(this.gl2.TEXTURE_2D, this.gl2.TEXTURE_MAG_FILTER, this.gl2.LINEAR);
    this.gl2.texParameteri(this.gl2.TEXTURE_2D, this.gl2.TEXTURE_MIN_FILTER, this.gl2.LINEAR);
    this.gl2.texParameteri(this.gl2.TEXTURE_2D, this.gl2.TEXTURE_WRAP_S, this.gl2.CLAMP_TO_EDGE);
    this.gl2.texParameteri(this.gl2.TEXTURE_2D, this.gl2.TEXTURE_WRAP_T, this.gl2.CLAMP_TO_EDGE);
    this.gl2.texImage2D(this.gl2.TEXTURE_2D, 0, this.gl2.RGBA, width, height, 0, this.gl2.RGBA, this.gl2.UNSIGNED_BYTE, dummyArray);

    // 縦横サイズを登録
    var widthLocation = this.gl2.getUniformLocation(program, "width");
    this.gl2.uniform1i(widthLocation, width);
    var heightLocation = this.gl2.getUniformLocation(program, "height");
    this.gl2.uniform1i(heightLocation, height);

    // 位置情報として、index番号を与える
    var attLocation = this.gl2.getAttribLocation(program, "Position");
    this.gl2.enableVertexAttribArray(attLocation);
    // 最終的に作成しないといけないポイント数はwidth * height * 3 / 2 / 4
    this.length = width * height * 3 / 8;
    var pos = new Float32Array(this.length);
    for(var i = 0;i < this.length;++ i) {
      pos[i] = i;
    }
    this.gl2.bindBuffer(this.gl2.ARRAY_BUFFER, this.gl2.createBuffer());
    this.gl2.bufferData(this.gl2.ARRAY_BUFFER, pos, this.gl2.STATIC_DRAW);
    this.gl2.vertexAttribPointer(attLocation, 1, this.gl2.FLOAT, false, 0, 0);

    // transform feedbackを準備
    this.vTransformFeedback = this.gl2.createBuffer();
    this.transformFeedback = this.gl2.createTransformFeedback();
    this.gl2.bindBuffer(this.gl2.ARRAY_BUFFER, this.vTransformFeedback);
    this.gl2.bufferData(this.gl2.ARRAY_BUFFER, Uint32Array.BYTES_PER_ELEMENT * this.length, this.gl2.DYNAMIC_COPY);
    this.gl2.bindBuffer(this.gl2.ARRAY_BUFFER, null);
  }
  public drain(
      source:HTMLImageElement|HTMLVideoElement|HTMLCanvasElement,
      target:Uint8Array):boolean {
    if(source == null) {
      return false;
    }
    if(source instanceof HTMLVideoElement) {
      if(source.readyState != 4) {
        return true;
      }
    }
    // textureを更新
    this.gl2.activeTexture(this.gl2.TEXTURE0);
    this.gl2.bindTexture(this.gl2.TEXTURE_2D, this.captureTexture);
    this.gl2.texImage2D(this.gl2.TEXTURE_2D, 0, this.gl2.RGBA, this.gl2.RGBA, this.gl2.UNSIGNED_BYTE, source);

    // transformFeedbackを実行
    this.gl2.bindTransformFeedback(this.gl2.TRANSFORM_FEEDBACK, this.transformFeedback);
    this.gl2.bindBufferBase(this.gl2.TRANSFORM_FEEDBACK_BUFFER, 0, this.vTransformFeedback);
    this.gl2.beginTransformFeedback(this.gl2.POINTS);
    this.gl2.drawArrays(this.gl2.POINTS, 0, this.length);
    this.gl2.endTransformFeedback();

    // 結果を取り出す
    this.gl2.getBufferSubData(this.gl2.TRANSFORM_FEEDBACK_BUFFER, 0, target);
    return true;
  }
  public close() {
  }
}
