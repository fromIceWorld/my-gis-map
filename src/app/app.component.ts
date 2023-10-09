import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { transformValue } from 'src/common/index.js';
import { config } from '../../src/decorators/config.js';
import * as echarts from '../assets/lib/ecahrts.min4.9.js';
import { overlayEchartsInit } from '../assets/lib/leaflet-echarts.js';
import { EchartsService } from './echarts.service';
import { GIS_CONFIG } from './gis-config.js';
import { getEchartsOption } from './options/echarts.option.js';
declare var require: any;
echarts.registerMap('50000', require('../assets/json/china.json'));

overlayEchartsInit();
@config(GIS_CONFIG)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnChanges {
  @Input('timeScope') timeScope = '';
  @Input('type') type = '';
  @Output('pointClick') pointClick = new EventEmitter();
  static tagNamePrefix: string = 'my-gis-map';
  @ViewChild('map', { static: true }) map: any;
  mapIns: any;
  overlay: any;
  center = [37.550339, 104.114129];
  zoom = 4;
  tileSource = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  tileSourceGeoq =
    'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
  tileSourceCustom = 'http://10.7.212.154:29099/map/geoq/{z}/{y}/{x}';
  constructor(private service: EchartsService) {}
  ngOnInit(): void {
    this.initMap();
    this.renderEcharts();
    // this.renderPolygon();
    EchartsService.eventBus.subscribe((res: any) => {
      this.pointClick.emit(res);
    });
  }
  ngOnChanges(input: any) {
    const { timeScope, type } = input;
    EchartsService.timeScope = timeScope.currentValue;
    EchartsService.type = type.currentValue;
  }

  // 初始化gis地图
  initMap() {
    var map = (this.mapIns = L.map(this.map.nativeElement, {
      minZoom: 4,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
    }));
    L.tileLayer(this.tileSourceGeoq).addTo(map);
    //@ts-ignore
    this.focus(this.center, this.zoom); //设置缩放级别及中心点
  }
  // 聚焦
  focus(coods: number[], zoom: number) {
    //@ts-ignore
    this.mapIns.setView(L.latLng(...coods), zoom); //设置缩放级别及中心点
  }
  renderPolygon(city: string) {
    // 多边形
    // create a red polygon from an array of LatLng points
    var shandong = require(`../assets/json/${city}.json`);
    //@ts-ignore
    var polygon = L.polygon(shandong, { color: 'rgb(22 98 134)' }).addTo(
      this.mapIns
    );
    // zoom the map to the polygon
    this.mapIns.fitBounds(polygon.getBounds());
  }
  // 贴 echarts 内部配置由echarts决定【散点图，热力图，飞线图....】
  renderEcharts() {
    //将Echarts加到地图上
    // @ts-ignore
    var overlay = (this.overlay = L.overlayEcharts(getEchartsOption()).addTo(
      this.mapIns
    ));
    console.log('overlay', overlay);
  }
  applyEchartsPoint(list: any[]) {
    let options = EchartsService.echartsIns.getOption();
    console.log(options);
    options.series[0].data = list.map((item) => {
      const { name, coord, threatIndex, loophole, flow, events } = item;
      return {
        name,
        value: [...coord, threatIndex],
        gis: {
          threatIndex,
          loophole,
          flow,
          events,
        },
      };
    });
    EchartsService.echartsIns.setOption({ ...options });
    //@ts-ignore
    this.overlay._echartsOption = { ...options };
  }
  static extends(option: any): { tagName: string; html: string; js: string } {
    // web component 的索引不能递增，因为索引重置后会重复，而且cache后apply会有冲突。
    const index = String(Math.random()).substring(2),
      tagName = `${AppComponent.tagNamePrefix}-${index}`;
    const { html, css, className } = option;
    let styleStr = '';
    for (let [key, value] of Object.entries(css)) {
      // @ts-ignore
      styleStr += `${key}:${value.value}${value.postfix || ''};`;
    }
    let config: any = {};
    Object.keys(html).map((key) => {
      config[key] = transformValue(html[key]);
    });
    return {
      tagName: `${tagName}`,
      html: `<${tagName} _data="_ngElementStrategy.componentRef.instance"
                        _methods="_ngElementStrategy.componentRef.instance" 
                       style="${styleStr}"></${tagName}>`,
      js: `class MyGis${index} extends ${className}{
             constructor(){
                 super();
             }
         }
         MyGis${index}.ɵcmp.factory = () => { return new MyGis${index}()};
         (()=>{
          let customEl = createCustomElement2(MyGis${index}, {  injector: injector2,});
          // 添加用户自定义数据
          Object.defineProperty(customEl.prototype,'option',{
            get(){
              return ${JSON.stringify(config)}
            },
            configurable: false,
            enumerable: false
          })
          // 获取class instance
          Object.defineProperty(customEl.prototype,'instance',{
            get(){
              return this._ngElementStrategy.componentRef.instance
            },
            configurable: false,
            enumerable: false
          })
          customElements.define('${tagName}',customEl);
       })();
         `,
    };
  }
}
