import { EchartsService } from "../echarts.service";
function getEchartsOption() {
  return {
    title: {
      text: "",
      subtext: "",
      sublink: "",
      x: "center",
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "#fff0",
      formatter: function (params) {
        console.log("tootip", params);
        const { name, gis } = params.data;
        const { threatIndex, loophole, flow, events } = gis;
        return `<div id="customTooltip"
        style="
          background: url(assets/img/M1_card_bg.png)
            no-repeat center;
          width: 22.4rem;
          height: 12.5rem;
          background-size: 100% 100%;
          filter: none;
          position: relative;
          align-items: center;
          display: flex;
          justify-content: space-around;
          background-size: cover;
          padding-right: 2rem;
          padding-left: 1rem;
        "
      >
        <div
          style="
            color: rgb(250 255 250);
            height: 2.9rem;
            /* line-height: 5.3rem; */
            /* padding-left: 5.3rem; */
            position: absolute;
            font-size: 1.6rem;
            left: 1.5rem;
            top: 0.2rem;
          "
        >
        ${name}
        </div>
        <div style="display: flex; justify-content: space-evenly; flex: 2">
          <div style="text-align: center">
            <p
              style="
                color: #c4deff;
                font-size: 1.3rem;
                font-family: Microsoft YaHei;
                height: 1.3rem;
                line-height: 1.3rem;
                margin-top: 3rem;
              "
            >
              威胁指数
            </p>
            <p
              id="obj0"
              style="
                color: #ffce4c;
                font-family: myFirstFont;
                font-size: 4rem;
                height: 4rem;
                line-height: 4rem;
                margin-top: 0.8rem;
              "
            >
              ${threatIndex}
            </p>
          </div>
        </div>
        <div
          style="display: flex; flex-direction: column; flex: 3; padding-left: 1rem"
        >
          <div
            style="display: flex; margin-top: 3.6rem; justify-content: space-between"
          >
            <p
              style="
                font-size: 1.2rem;
                color: #6fc7ff;
                height: 1.2rem;
                line-height: 1.2rem;
              "
            >
              漏洞总数
            </p>
            <p
              id="obj1"
              style="
                font-size: 1.2rem;
                color: #ecfbff;
                height: 1.7rem;
                line-height: 1.7rem;
              "
            >
            ${loophole}
            </p>
          </div>
          <div
            style="display: flex; margin-top: 1.4rem; justify-content: space-between"
          >
            <p
              style="
                font-size: 1.2rem;
                color: #6fc7ff;
                height: 1.2rem;
                line-height: 1.2rem;
              "
            >
              境外异常流量
            </p>
            <p
              id="obj2"
              style="
                font-size: 1.2rem;
                color: #ecfbff;
                height: 1.7rem;
                line-height: 1.7rem;
              "
            >
            ${flow}
            </p>
          </div>
          <div
            style="display: flex; margin-top: 1rem; justify-content: space-between"
          >
            <p
              style="
                font-size: 1.2rem;
                color: #6fc7ff;
                height: 1.2rem;
                line-height: 1.2rem;
              "
            >
              安全事件
            </p>
            <p
              id="obj3"
              style="
                font-size: 1.2rem;
                color: #ecfbff;
                height: 1.7rem;
                line-height: 1.7rem;
              "
            >
            ${events}
            </p>
          </div>
        </div>
      </div>`;
      },
    },
    legend: {
      orient: "vertical",
      y: "bottom",
      x: "right",
      data: ["pm2.5"],
      textStyle: {
        color: "#fff",
      },
    },
    // visualMap: {
    //     min: 0,
    //     max: 200,
    //     calculable: true,
    //     inRange: {
    //         color: ['#50a3ba', '#eac736', '#d94e5d'],
    //     },
    //     textStyle: {
    //         color: '#fff',
    //     },
    // },
    geo: {
      map: "50000",
      show: false,
      label: {
        emphasis: {
          show: false,
        },
      },
      itemStyle: {
        normal: {
          areaColor: "#323c48",
          borderColor: "#111",
        },
        emphasis: {
          areaColor: "#2a333d",
        },
      },
    },
    series: [
      {
        name: "",
        type: "scatter",
        coordinateSystem: "geo",
        data: [],
        symbol: (arr, params) => {
          const [lng, lat, value] = arr;
          return `image://assets/img/map-ico${value > 100 ? 5 : 6}.png`;
        },
        // symbol: "circle",
        symbolSize: [20, 40],
        label: {
          normal: {
            show: false,
          },
          emphasis: {
            show: false,
          },
        },
        itemStyle: {
          emphasis: {
            borderColor: "#fff",
            borderWidth: 1,
          },
        },
      },
      // {
      //   type: "lines",
      //   zlevel: 50,
      //   effect: {
      //     show: true,
      //     period: 8,
      //     trailLength: 0.01,
      //     symbol: "arrow",
      //     symbolSize: 5,
      //   },
      //   lineStyle: {
      //     normal: {
      //       color: "red",
      //       curveness: 0.5,
      //       width: 1,
      //       opacity: 1,
      //     },
      //   },
      //   data: [
      //     [
      //       { name: "北京", coord: [116.405285, 39.904989] },
      //       { name: "苏尼特左旗", coord: [113.653412, 43.854108] },
      //       123,
      //     ],
      //   ],
      // },
    ],
  };
}
export { getEchartsOption };
