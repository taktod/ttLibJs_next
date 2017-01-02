# ttlibjs_next

# 作者
taktod <https://twitter.com/taktod>

# 概要
ttLibJsのtypescriptで使った場合のreferenceとかやりにくいので、まとめ直す。
ベースはwebpackにする。
nodeでの利用は考えないが、typescriptでrequireができるようにはしておく。

動作テストもwebpackでできるようにしておく。

# 利用コマンド

```
npm run test
```

動作テストする。

```
npm run build
```
生成データを作る。

この２つ。

# 利用方法

## webで使う場合

ttLibJs.jsをscriptタグのsrcで読み込むと
ttでアクセスできるようになる。

## typescriptで使う場合

import {tt} from "ttlibjs_next";
とすると
ttでアクセスできるようになる。

こんな具合でやってみる
