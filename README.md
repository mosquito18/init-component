# init-component


## 学习知识点
1. HTML 中 `<%%>`、`<%=%>`、`<%:%>`

`<%%>`之间可以写服务器端代码
```
<%
    for(var i=0;i<10;i++){
        //执行循环体
    }
%>
```

`<%=%>`用来绑定数据的
```
import _ from 'lodash'

var compiled = _.template('hello <%= user %>!');

compiled({ 'user': 'fred' });
```

`<%:%>`相当于`<%=Html.Encode()%>`，默认对内容进行html编码输出

`<%=%>`与`<%:%>`的区别在于，<%=%>不进行html编码，会将内容全部输出,而<%:%>则会将中间内容进行html编码

2. [lodash.template](https://www.lodashjs.com/docs/lodash.template#_templatestring-options): 创建一个预编译模板方法，可以插入数据到模板中 "interpolate" 分隔符相应的位置

```
// 使用 "interpolate" 分隔符创建编译模板
var compiled = _.template('hello <%= user %>!');
compiled({ 'user': 'fred' });
// => 'hello fred!'

// 使用 ES 分隔符代替默认的 "interpolate" 分隔符
var compiled = _.template('hello ${ user }!');
compiled({ 'user': 'pebbles' });
// => 'hello pebbles!'

```
