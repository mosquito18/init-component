const fs = require('fs');
const config = require('./config');
const _ = require('lodash');
const path = require('path');

// 获取当前项目的工作目录（相当于根目录）
const cwdPath = process.cwd();

// 执行单元测试的时候生成测试的快照文件 snapshots
function getSnapshotFiles(component) {
    return {
        [`test/unit/${component}/__snapshots__/`]: {
            desc: 'snapshot test',
            files: ['index.test.js.snap', 'demo.test.js.snap'],
        },
    };
}

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

function deleteComponent(toBeCreatedFiles, component) {
    const snapShotFiles = getSnapshotFiles(component);
    const files = Object.assign(toBeCreatedFiles, snapShotFiles);

    Object.keys(files).forEach((dir) => {
        deleteFolderRecursive(dir);
    });
    console.log('All radio files have been removed.', 'success');
}

function getFirstLetterUpper(a) {
    return a[0].toUpperCase() + a.slice(1);
}

function createFile(path, data = '', desc) {
    fs.writeFile(path, data, (err) => {
        if (err) {
            console.log(err, 'error');
        } else {
            console.log(`> ${desc}\n${path} file has been created successfully！`, 'success');
        }
    });
}

function outputFileWithTemplate(item, component, desc, _d) {
    const tplPath = path.resolve(__dirname, `./tpl/${item.template}`);
    let data = fs.readFileSync(tplPath).toString();
    const compiled = _.template(data);

    data = compiled({
        component,
        upperComponent: getFirstLetterUpper(component),
    });
    const _f = path.resolve(_d, item.file);
    createFile(_f, data, desc);
}

function addComponent(toBeCreatedFiles, component) {
    Object.keys(toBeCreatedFiles).forEach((dir) => {
        const _d = path.resolve(cwdPath, dir);
        /**
         * recursive: true  是否应该创建父文件夹的对象
         */
        fs.mkdir(_d, { recursive: true }, (err) => {
            if (err) {
                console.log(err, 'error');
                return;
            }
            console.log(`${_d} directory has been created successfully！`);
            const contents = toBeCreatedFiles[dir];
            contents.files.forEach((item) => {
                if (typeof item === 'object') {
                    if (item.template) {
                        outputFileWithTemplate(item, component, contents.desc, _d);
                    }
                } else {
                    const _f = path.resolve(_d, item);
                    createFile(_f, '', contents.desc);
                }
            });
        })

    })
}

function getImportStr(upper, component) {
    return `import ${upper} from './${component}';`;
}

function deleteComponentFromIndex(component, indexPath) {
    const upper = getFirstLetterUpper(component);
    const importStr = `${getImportStr(upper, component)}\n`;
    let data = fs.readFileSync(indexPath).toString();
    data = data.replace(new RegExp(importStr), () => '').replace(new RegExp(`  ${upper},\n`), '');
    fs.writeFile(indexPath, data, (err) => {
        if (err) {
            console.log(err, 'error');
        } else {
            console.log(`${component} has been removed from /src/index.ts`, 'success');
        }
    });
}

function insertComponentToIndex(component, indexPath) {
    const upper = getFirstLetterUpper(component);
    /**
     * . 匹配除换行符（\n、\r）之外的任何单个字符
     * ? 问号代表前面的字符最多只可以出现一次（0次或1次）
     * ( ) 标记一个子表达式的开始和结束位置。
     * '\n' 匹配换行符
     * 
     * .* 匹配*字符
     */
    const importPattern = /import.*?;(?=\n\n)/;
    const cmpPattern = /(?<=const components = {\n)[.|\s|\S]*?(?=};\n)/g;
    const importPath = getImportStr(upper, component);
    const desc = '> insert component into index.ts';
    let data = fs.readFileSync(indexPath).toString();
    if (data.match(new RegExp(importPath))) {
        console.log(`there is already ${component} in /src/index.ts`, 'notice');
        return;
    }
    data = data.replace(importPattern, (a) => `${a}\n${importPath}`).replace(cmpPattern, (a) => `${a}  ${upper},\n`);

    fs.writeFile(indexPath, data, (err) => {
        if (err) {
            console.log(err, 'error');
        } else {
            console.log(`${desc}\n${component} has been inserted into /src/index.ts`, 'success');
        }
    });


}

function init() {
    // npm run init mosquito
    /**
     * process.argv
     * [
        '/usr/local/Cellar/node/16.0.0_1/bin/node',               ------- Nodejs的路径
        '/Users/mosquito/@mosquito/init-component/script/init',   ------- 当前js文件的所在路径
        'mosquito'                                                ------- 命令行中自己定义的
        ]
     */
    const [component, isDeleted] = process.argv.slice(2);

    if (!component) {
        console.error('[组件名]必填 - Please enter new component name');
        process.exit(1);
    }

    // 通过path.resolve拼接src下index.ts的完整路径
    const indexPath = path.resolve(cwdPath, 'src/index.ts');

    const toBeCreatedFiles = config.getToBeCreatedFiles(component);

    if (isDeleted === 'del') {
        deleteComponent(toBeCreatedFiles, component);
        deleteComponentFromIndex(component, indexPath);
    } else {
        addComponent(toBeCreatedFiles, component);
        insertComponentToIndex(component, indexPath);
    }
}

init()