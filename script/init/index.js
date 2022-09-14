const fs = require('fs');
const config = require('./config');
const _ = require('lodash');
const path = require('path');

// 获取当前项目的工作目录（相当于根目录）
const cwdPath = process.cwd();

function getSnapshotFiles(component) {
    return {
        // [`test/unit/${component}/__snapshots__/`]: {
        //     desc: 'snapshot test',
        //     files: ['index.test.js.snap', 'demo.test.js.snap'],
        // },
    };
}

function deleteComponent(toBeCreatedFiles, component) {
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

function insertComponentToIndex(component, indexPath) {
    const upper = getFirstLetterUpper(component);
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
    // TODO:
    console.log(data, '============')
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
        // deleteComponent(toBeCreatedFiles, component);
        // deleteComponentFromIndex(component, indexPath);
    } else {
        addComponent(toBeCreatedFiles, component);
        insertComponentToIndex(component, indexPath);
    }
}

init()