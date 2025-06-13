const fs = require('fs');
const path = require('path');

const starKeys = [
    // Major Stars
    "ziweiMaj", "taiyangMaj", "wuquMaj", "tiantongMaj", "lianzhenMaj", "tianfuMaj", "taiyinMaj", "tanlangMaj", "jumenMaj", "tianxiangMaj", "tianliangMaj", "qishaMaj", "pojunMaj",
    // Minor Stars
    "zuofuMin", "youbiMin", "wenchangMin", "wenquMin", "tiankuiMin", "tianyueMin", "lucunMin", "tianmaMin", "dikongMin", "dijieMin", "huoxingMin", "lingxingMin", "qingyangMin", "tuoluoMin",
    // Adjective Stars
    "hongluan", "tianxi", "tianyao", "xianchi", "jieshen", "santai", "bazuo", "engguang", "tiangui", "longchi", "fengge", "tiancai", "tianshou", "taifu", "fenggao", "tianwu", "huagai", "tianguan", "tianfu", "tianchu", "tianyue", "tiande", "yuede", "tiankong", "xunkong", "jielu", "kongwang", "longde", "jiekong", "jieshaAdj", "dahao", "guchen", "guasu", "feilian", "posui", "tianxing", "yinsha", "tianku", "tianxu", "tianshi", "tianshang", "nianjie"
];

// In case tianjiMaj.json was already created
const tianjiIndex = starKeys.indexOf('tianjiMaj');
if (tianjiIndex > -1) {
    starKeys.splice(tianjiIndex, 1);
}

const targetDir = path.join(__dirname, 'src', 'data', 'star-info');

const templateContent = (key) => `{
  "name": "${key}",
  "description": "请在此处填写关于 ${key} 的描述...",
  "attributes": {
    "element": "",
    "yin_yang": "",
    "palace_master": "",
    "body_master": ""
  },
  "meanings": {
    "personality": [],
    "career": "",
    "wealth": "",
    "health": ""
  },
  "combinations": [],
  "temple_brightness": {
    "庙": "",
    "旺": "",
    "得地": "",
    "利": "",
    "平": "",
    "不得地": "",
    "陷": ""
  }
}`;

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

starKeys.forEach(key => {
    const filePath = path.join(targetDir, `${key}.json`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, templateContent(key), 'utf8');
        console.log(`已创建: ${filePath}`);
    }
});

console.log("脚本执行完毕。已成功创建所有指定的星耀JSON文件。"); 