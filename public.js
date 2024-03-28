// 用于将组件发布到数据库系统中。

/**
 * view 节点的范围 [1:只在视图区, 2:只在关系区, 3:即在视图区也在关系区]
 */
const components = [
  {
    id: "gis-map",
    name:"GIS",
    type: "node",
    icon: "#icon-gisditu",
    title: `地图:
                    Angular@16.1+leaflet+echarts`,
    view: 4,
    family: "chart",
    color: "#2f938f",
    des: "基础的gis地图",
    component: "GisMapComponent",
  },
];
const fs = require("fs"),
  path = require("path"),
  request = require("request");
const filesName = [
  { name: "main.js", decorator: { defer: true } },
  // { name: "polyfills.js", decorator: { defer: true } },
  { name: "runtime.js", decorator: { defer: true } },
  //   { name: 'vendor.js', decorator: { defer: true } },
  "styles.css",
];
const area = "gis",
  folderPath = "./dist/my-gis-map";
components.map((item) => {
  item["filesName"] = filesName;
  item["area"] = area;
});
let options = {
  url: "http://127.0.0.1:3000/upload",
  method: "POST",
  headers: {
    "content-type": "multipart/form-data",
  },
  formData: {
    files: [],
    area,
    components: JSON.stringify(components),
  },
};

// 递归遍历文件夹中的所有文件
function uploadFolder(folderPath, dir) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = folderPath + "/" + file;
    // 判断是否为文件夹
    if (fs.statSync(filePath).isDirectory()) {
      // 递归上传子文件夹
      uploadFolder(filePath, dir + "/" + file);
    } else {
      // 上传文件
      uploadFile(filePath, dir, file);
    }
  });
}

// 缓存上传文件
function uploadFile(filePath, dir, fileName) {
  const content = fs.readFileSync(path.resolve(__dirname, filePath));
  options.formData.files.push({
    content: Buffer.from(content).toString(),
    dir,
    fileName,
  });
}
// 将文件缓存
uploadFolder(folderPath, "");
console.log("共上传文件数：", options.formData.files.length);
//@ts-ignore
options.formData.files = JSON.stringify(options.formData.files);
request(options, (err, res, body) => {
  if (res.statusCode === 200) {
    console.log("上传完成");
  } else {
    console.log(body);
  }
});
