# init-component
1. 通过`process.argv`获取命令行参数
2. 使用lodash的template、compiled 模板字符串的编译替换生成想要的字符串，再写入文件
3. 利用fs进行删除文件、创建文件、删除文件夹、创建文件夹、写入文件等操作

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

3. 递归删除文件

```
function deleteFolderRecursive(path) {
    // 先判断路径是否存在
    if (fs.existsSync(path)) {
        // 路径存在则读取path路径下的所有文件，进行循环
        fs.readdirSync(path).forEach((file) => {
            const current = `${path}/${file}`;
            // 如果current是一个路径目录则进行递归调用
            if (fs.statSync(current).isDirectory()) {
                deleteFolderRecursive(current);
            } else {
                // 如果是个文件则删除即可
                fs.unlinkSync(current);
            }
        });
        // 上面文件删除了，再进行目录的删除
        fs.rmdirSync(path);
    }
}

```