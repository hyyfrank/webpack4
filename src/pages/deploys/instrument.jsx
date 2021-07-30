import React, { Component } from "react";
import { Breadcrumb, Divider, message, Select } from "antd";
import { HomeOutlined, PictureOutlined } from "@ant-design/icons";

import { fetchAllDevices, fetchAllInsturment } from "../../services/devices";
import CanavasRectangleComponet from "./rectangle";
import * as style from "../../css/detail.less";
import { fetchServiceSupportList } from "../../services/deploys";
import APICONST from "../../services/APIConst";

const { Option } = Select;
class InstrumentComponent extends Component {
  constructor() {
    super();
    this.onChouzhenTimeChange = this.onChouzhenTimeChange.bind(this);
    this.onDetectTimeChange = this.onDetectTimeChange.bind(this);
    this.onActiveStatusChange = this.onActiveStatusChange.bind(this);
    this.clearMonitorArea = this.clearMonitorArea.bind(this);

    this.state = {
      basicInfo: {},
      detailCarema: {},
      monitorArea: [],
      selectedCaremaChouzhen: "1",
      selectedDetectTime: "15",
      enableStatus: "false"
    };
  }

  componentDidMount() {
    // console.log("i am in detail didmount");
    const { BASE_URL } = APICONST;
    // console.log(`this.props${JSON.stringify(this.props)}`);
    const { iotCode } = this.props;
    console.log(`外面 iotCode get: ${iotCode}`);
    const algoFieldIdMapping = [];
    this.setState({
      basicInfo: {
        monitorImageUrl: `${BASE_URL}/?filename=picture/${iotCode}.jpg`
      }
    });
    fetchServiceSupportList()
      .then(({ data }) => {
        if (data.response.state === "error") {
          message.error("fetch service support list error! ");
          return;
        }
        const details = data.response.detail;
        const isAlgoritmServer = sessionStorage.getItem("isAlgoritmServer");
        console.log(`isAlgo:${isAlgoritmServer}`);
        let serviceCFGList;
        if (isAlgoritmServer === "true") {
          serviceCFGList = details.servicesCFG;
        } else {
          serviceCFGList = details[0].servicesCFG;
        }
        serviceCFGList.map((item) => {
          if (item.ID.length > 1) {
            for (let i = 0; i < item.ID.length; i++) {
              algoFieldIdMapping.push({
                ID: item.ID[i],
                algoName: item.name[i],
                gpu: item.GPUMemory
              });
            }
          } else {
            algoFieldIdMapping.push({
              ID: item.ID[0],
              algoName: item.name[0],
              gpu: item.GPUMemory
            });
          }
        });
        // console.log(`algoFieldIdMapping:${JSON.stringify(algoFieldIdMapping)}`);
      })
      .then(() => {
        const formData = new FormData();
        const obj = {
          type: "SOURCE_LIST",
          ctrl_key:
            sessionStorage.getItem("ctrl_key") == null
              ? -1
              : Number(sessionStorage.getItem("ctrl_key"))
        };
        formData.append("req", JSON.stringify(obj));
        return fetchAllDevices(formData);
      })
      .then(({ data }) => {
        // console.log(`get data from devices: ${JSON.stringify(data)}`);
        if (data.response.state === "error") {
          console.log("state error, please retry.");
          message.error("fetch source list error! ");
          this.setState({ tableData: [] });
        } else {
          const caremaDetailInfo = data.response.detail.filter((item) => {
            return item.IoTCode === iotCode;
          });

          // console.log(`filter carema:${JSON.stringify(caremaDetailInfo)}`);
          let serviceID;
          if (caremaDetailInfo.length > 0) {
            serviceID = caremaDetailInfo[0].serviceID;
            this.setState({
              detailCarema: caremaDetailInfo[0]
            });
          }
          // console.log(`filter carema,and get serviceID:${serviceID}`);
          // console.log(
          //   `filter carema,and get region:${JSON.stringify(
          //     caremaDetailInfo[0].region
          //   )}`
          // );

          const algoItem = algoFieldIdMapping.filter((item) => {
            return item.ID === serviceID;
          });
          console.log(`filter by id:${JSON.stringify(algoItem)}`);
          if (algoItem.length > 0) {
            const { algoName } = algoItem[0];
            const { gpu } = algoItem[0];
            let algoDesc = "";
            if (algoName === "Platform") {
              algoDesc = "月台车辆分析";
            }
            if (algoName === "Road" || algoName === "Room") {
              algoDesc = "消防通道分析";
            }
            if (algoName === "WareHouse") {
              algoDesc = "仓库占用分析";
            }
            if (algoName === "HelmetEntrance") {
              algoDesc = "工地进出口安全帽分析";
            }
            if (algoName === "HelmetWork") {
              algoDesc = "工地作业区安全帽分析";
            }
            if (algoName === "StatusLight") {
              algoDesc = "状态灯检测";
            }
            this.setState({
              basicInfo: {
                algorithmName: algoDesc,
                GPU: gpu
              },
              selectedCaremaChouzhen: caremaDetailInfo[0].interval.toString(),
              selectedDetectTime: caremaDetailInfo[0].times.toString(),
              enableStatus: caremaDetailInfo[0].enable.toString()
            });
            console.log(`${BASE_URL}/?filename=picture/${iotCode}.jpg`);
          }
        }
      })
      .then(() => {
        console.log("start to call the new region area");
        const formData = new FormData();
        const obj = {
          type: "SOURCELIST",
          ctrl_key:
            sessionStorage.getItem("ctrl_key") == null
              ? -1
              : Number(sessionStorage.getItem("ctrl_key"))
        };
        formData.append("req", JSON.stringify(obj));
        return fetchAllInsturment(formData);
      })
      .then(({ data }) => {
        console.log("fetch the insturment list is :");
        console.log(JSON.stringify(data));
      });
  }

  onChouzhenTimeChange(val) {
    console.log(`chouzhen select${val}`);
    this.setState({ selectedCaremaChouzhen: val });
  }

  onDetectTimeChange(val) {
    console.log(`detect time select${val}`);
    this.setState({ selectedDetectTime: val });
  }

  onActiveStatusChange(val) {
    console.log(`detect time select${val}`);
    this.setState({ enableStatus: val });
  }

  clearMonitorArea() {
    console.log("重新绘制");
  }

  render() {
    const {
      basicInfo,
      selectedCaremaChouzhen,
      selectedDetectTime,
      enableStatus,
      detailCarema
    } = this.state;
    const imageInfos = {
      IOTCode: detailCarema.IoTCode
    };

    const imageRectParms = {
      monitorImageUrl: basicInfo.monitorImageUrl,
      state: true,
      desc: "StatusLight",
      data: [
        {
          ID: "a9049f5f776111ebbf91506b4b2aa321",
          region: [
            [1134, 721],
            [1189, 726],
            [1189, 775],
            [1131, 772]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa320",
          region: [
            [1066, 715],
            [1125, 718],
            [1119, 771],
            [1063, 771]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa319",
          region: [
            [1000, 714],
            [1051, 715],
            [1050, 771],
            [996, 771]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa318",
          region: [
            [928, 711],
            [985, 714],
            [984, 769],
            [924, 769]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa317",
          region: [
            [804, 703],
            [853, 706],
            [855, 766],
            [801, 766]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa316",
          region: [
            [736, 703],
            [784, 705],
            [783, 765],
            [736, 762]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa315",
          region: [
            [672, 703],
            [723, 709],
            [723, 756],
            [669, 756]
          ],
          result: { confidence: 1.0, value: 0 }
        },
        {
          ID: "a9049f5f776111ebbf91506b4b2aa314",
          region: [
            [607, 699],
            [657, 703],
            [657, 756],
            [603, 750]
          ],
          result: { confidence: 1.0, value: 0 }
        }
      ],
      serviceID: 2,
      IoTCode: detailCarema.IoTCode,
      jpg: "./picture/2021-07-26/21097000663_20210727000000.jpg",
      cameraID: "21097000663",
      time: "2021-07-27 00:00:00"
    };

    // console.log(`pass to rec: ${JSON.stringify(imageRectParms)}`);

    return (
      <div className={style.mainContent}>
        <div className={style.BreadcrumbPart}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/deploys">
              <PictureOutlined />
              <span>部署列表</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/detail">
              <PictureOutlined />
              <span>设备详情</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={style.tableLayer}>
          <Divider orientation="left">基本信息</Divider>
          <div className={style.basicInfo}>
            <div className={style.basicInfoLayout}>
              <div>
                <span className={style.basicSubTitle}>园区：</span>
                <span className={style.basicSubContent}>北京-GTX1080Ti</span>
              </div>
              <div>
                <span className={style.basicSubTitle}>算法场景：</span>
                <span className={style.basicSubContent}>
                  {basicInfo.algorithmName}
                </span>
              </div>
              <div>
                <span className={style.basicSubTitle}>显存:</span>
                <span className={style.basicSubContent}>{basicInfo.GPU}G</span>
              </div>
            </div>
          </div>
          <Divider orientation="left">摄像机信息</Divider>
          <div className={style.IOTInfo}>
            <div className={style.iotInfoLayout}>
              <div className={style.editItemLayout}>
                <span className={style.basicSubTitle}>抽帧间隔：</span>
                <Select
                  disabled
                  style={{ width: 120 }}
                  value={selectedCaremaChouzhen}
                  onChange={this.onChouzhenTimeChange}
                >
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="15">15</Option>
                  <Option value="30">30</Option>
                  <Option value="60">60</Option>
                  <Option value="300">300</Option>
                  <Option value="600">600</Option>
                </Select>
              </div>
              <div className={style.editItemLayout}>
                <span className={style.basicSubTitleWithMargin}>
                  检测时间：
                </span>
                <Select
                  disabled
                  style={{ width: 120 }}
                  value={selectedDetectTime}
                  onChange={this.onDetectTimeChange}
                >
                  <Option value="15">15s</Option>
                  <Option value="30">30s</Option>
                  <Option value="60">60s</Option>
                  <Option value="120">120s</Option>
                  <Option value="180">180s</Option>
                  <Option value="240">240s</Option>
                  <Option value="300">300s</Option>
                  <Option value="360">360s</Option>
                  <Option value="420">420s</Option>
                  <Option value="480">480s</Option>
                  <Option value="540">540s</Option>
                  <Option value="600">600s</Option>
                  <Option value="720">720s</Option>
                  <Option value="900">900s</Option>
                  <Option value="1800">1800s</Option>
                </Select>
              </div>
              <div className={style.editItemLayout}>
                <span className={style.basicSubTitleWithMargin}>
                  激活状态：
                </span>
                <Select
                  disabled
                  value={enableStatus}
                  style={{ width: 120 }}
                  onChange={this.onActiveStatusChange}
                >
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              </div>
            </div>
          </div>
          <Divider orientation="left">监控区域</Divider>
          <div className={style.monitorArea}>
            <CanavasRectangleComponet {...imageRectParms} />
          </div>
        </div>
      </div>
    );
  }
}

export default InstrumentComponent;
