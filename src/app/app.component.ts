import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { transformValue } from 'src/common/index.js';
import { config } from '../../src/decorators/config.js';
import * as echarts from '../assets/lib/echarts.min5.4.3.js';
import { overlayEchartsInit } from '../assets/lib/leaflet-echarts.js';
import { EchartsService } from './echarts.service';
import { GIS_CONFIG } from './gis-config.js';
import { getEchartsOption } from './options/echarts.option.js';

type EchartsScatter = {
  name: string;
  value: [number | string, number | string, any];
};
type EchartsNode = {
  name: string;
  coords: [string | number, string | number];
  value: number;
};
type EchartsData = {
  source?: EchartsNode;
  target?: EchartsNode;
};

//@ts-ignore
declare var require: any;
echarts.registerMap('50000', require('../assets/json/china.json'));

overlayEchartsInit();
@config(GIS_CONFIG)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @Output('pointClick') pointClick = new EventEmitter();
  static tagNamePrefix: string = 'my-gis-map';
  @ViewChild('map', { static: true }) map: any;
  gisIns: any;
  overlayEcharts: any;
  center = [37.550339, 104.114129];
  zoom = 4;
  tileLayer: any;
  tileSource = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  tileSourceGeoq =
    'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
  tileSourceCustom =
    'http://10.7.212.153:30000/infrastructure-screen/map/{z}/{y}/{x}';
  constructor() {}
  ngOnInit(): void {
    this.initMap();
    this.initEcharts();
    this.renderPolygon('shandong');
    // this.createIconMarker();
    EchartsService.eventBus.subscribe((res: any) => {
      this.pointClick.emit(res);
    });
  }
  // 设置瓦片源
  setTileSource(source = this.tileSourceGeoq) {
    this.tileLayer.setUrl(source, false);
  }
  // 初始化gis地图
  initMap() {
    const corner1 = L.latLng(-90, -160),
      corner2 = L.latLng(90, 260);
    var map = (this.gisIns = L.map(this.map.nativeElement, {
      minZoom: 3,
      maxZoom: 10,
      maxBounds: L.latLngBounds(corner1, corner2),
      zoomControl: false, // 缩放按钮
      attributionControl: false,
    }));
    this.tileLayer = L.tileLayer(this.tileSourceCustom).addTo(map);
    //@ts-ignore
    this.focus(this.center, this.zoom); //设置缩放级别及中心点
  }

  // 聚焦
  focus(coods = this.center, zoom = this.zoom) {
    //@ts-ignore
    this.gisIns.setView(L.latLng(...coods), zoom); //设置缩放级别及中心点
  }
  // 绘制多边形
  async renderPolygon(cityName: string, prefix = 'assets/json/') {
    // 多边形
    // create a red polygon from an array of LatLng points
    var cityJSON = await fetch(`${prefix}${cityName}.json`).then((res) =>
      res.json()
    );
    //@ts-ignore
    var polygon = L.polygon(cityJSON, { color: 'rgb(22 98 134)' }).addTo(
      this.gisIns
    );
    // zoom the map to the polygon
    this.gisIns.fitBounds(polygon.getBounds());
    return polygon;
  }
  removePolygon(polygon: any) {
    this.gisIns.removeLayer(polygon);
  }
  // 贴 echarts 内部配置由echarts决定【散点图，热力图，飞线图....】
  initEcharts() {
    //将Echarts加到地图上
    // @ts-ignore
    this.overlayEcharts = L.overlayEcharts(getEchartsOption()).addTo(
      this.gisIns
    );
  }
  // create icon marker
  createIconMarker(coords: L.LatLngTuple = [43.854108, 113.653412]) {
    L.marker(coords, {
      icon: new L.Icon({
        className: 'map-icon',
        iconUrl: 'assets/img/marker.png',
        iconSize: [20, 20],
        iconAnchor: [16, 16],
      }),
    }).addTo(this.gisIns);
  }
  // 应用散点图,数据会映射到 scatter上
  applyScatter(list: EchartsScatter[] = []) {
    let options = this.getEchartsOption();
    //  scatter
    options.series[0].data = list;
    EchartsService.echartsIns.setOption({ ...options });
    //@ts-ignore
    this.overlayEcharts._echartsOption = { ...options };
  }
  // 应用迁徙数据,默认将source/target 数据映射到effectScatter，lines
  applyMigrationData(list: EchartsData[] = []) {
    let effectScatter: any[] = [],
      lines: any[] = [];
    list.forEach((item) => {
      const { source, target } = item;
      [target, source].forEach((node: any, index) => {
        const { name, coords, value } = node;
        // scatter.push({ name, value: [...coords, value, index], item: node });
        effectScatter.push({
          name,
          value: [...coords, value, index],
          item: node,
        });
      });
      // 有source，target时有连线
      if (source && target) {
        lines.push([
          { name: source.name, coord: source.coords },
          { name: target.name, coord: target.coords },
        ]);
      }
    });
    let options = this.getEchartsOption();
    //  effectScatter
    options.series[1].data = effectScatter;
    // lines
    options.series[2].data = lines;
    EchartsService.echartsIns.setOption({ ...options });
    //@ts-ignore
    this.overlayEcharts._echartsOption = { ...options };
  }
  getEchartsOption() {
    return EchartsService.echartsIns.getOption();
  }
  // 修改echarts Option 配置项
  applyEchartsOption(option = {}) {
    let oldOption = this.getEchartsOption();
    EchartsService.echartsIns.setOption({ ...oldOption, ...option });
    //@ts-ignore
    this.overlayEcharts._echartsOption = option;
    this.overlayEcharts.redraw();
  }
  static extends(option: any): { tagName: string; html: string; js: string } {
    // web component 的索引不能递增，因为索引重置后会重复，而且cache后apply会有冲突。
    const index = String(Math.random()).substring(2),
      tagName = `${AppComponent.tagNamePrefix}-${index}`;
    const { html, className } = option;
    let config: any = {};
    Object.keys({}).map((key) => {
      config[key] = transformValue(html[key]);
    });
    return {
      tagName: `${tagName}`,
      html: `<${tagName}></${tagName}>`,
      js: `class MyGis${index} extends ${className}{
             constructor(){
                 super();
             }
         }
         MyGis${index}.ɵcmp.factory = () => { return new MyGis${index}()};
         (()=>{
          let customEl = createCustomElement2(MyGis${index}, {  injector: injector2,});
          // 添加用户自定义数据
          Object.defineProperties(customEl.prototype,{
            option:{
              get(){
                return ${JSON.stringify(config)}
              },
              configurable: false,
              enumerable: false
            },
            instance:{
              get(){
                return this._ngElementStrategy.componentRef.instance
              },
              configurable: false,
              enumerable: false
            },
            setTileSource:function(source){
              this.instance.setTileSource(source)
            },
            focus:function(){
              this.instance.focus()
            },
            getEchartsOption:function(){
              this.instance.getEchartsOption()
            },
            applyEchartsOption:function(option){
              this.instance.applyEchartsOption(option)
            },
            applyMigrationData:function(list){
              this.instance.applyMigrationData()
            },
          })
          customElements.define('${tagName}',customEl);
        })();
         `,
    };
  }
}
