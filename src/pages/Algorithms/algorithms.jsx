import React, { Component } from "react";
import { Table, Breadcrumb } from "antd";
import { HomeOutlined, PictureOutlined } from "@ant-design/icons";

import { Link } from "react-router-dom";
import fetchDeployedAlgorithm from "../../services/algorithm";
import * as style from "../../css/algorithm.less";

class AlgorithmComponent extends Component {
  constructor() {
    super();
    this.state = {
      bottom: "bottomRight",
      isModalVisible: false,
      isDeleteVisiable: false,
      tableData: [],
    };
  }

  componentDidMount() {
    const formData = new FormData();
    const obj = {
      type: "SERVICE_SUPPORT",
      ctrl_key:
        sessionStorage.getItem("ctrl_key") == null
          ? -1
          : sessionStorage.getItem("ctrl_key"),
    };
    formData.append("req", JSON.stringify(obj));

    fetchDeployedAlgorithm(formData).then(({ data }) => {
      if (data.response.state === "error") {
        console.log("state error, please retry.");
        this.setState({ tableData: [] });
      } else {
        console.log(`algorithms data:${JSON.stringify()}`);
        this.setState({ tableData: data.response.detail[0].servicesCFG });
      }
    });
  }

  render() {
    const { bottom } = this.state;
    const columns = [
      {
        title: "算法场景名称",
        dataIndex: "name",
        key: "name",
        width: "16%",
        render: (name) => {
          if (name[0] === "Platform") {
            return <span className={style.platform}>月台车辆分析</span>;
          }
          if (name[0] === "Road" && name[1] === "Room") {
            return <span className={style.road}>消防通道分析</span>;
          }
          if (name[0] === "WareHouse") {
            return <span className={style.warehouse}>仓库占用分析</span>;
          }
          if (name[0] === "HelmetEntrance") {
            return (
              <span className={style.helmetentrance}>工地进出口安全帽分析</span>
            );
          }
          if (name[0] === "HelmetWork") {
            return (
              <span className={style.helmetwork}>工地作业区安全帽分析</span>
            );
          }
          return <span>name</span>;
        },
      },
      {
        title: "算法类型",
        dataIndex: "Type",
        key: "Type",
        width: "10%",
        render: (text) => {
          if (text === "ObjectDetection") {
            return <span className={style.objectDetect}>对象检测</span>;
          }
          if (text === "Classification") {
            return <span className={style.classification}>分类算法</span>;
          }
          return <span className={style.others}>其他</span>;
        },
      },
      {
        title: "GPU需求",
        dataIndex: "GPUMemory",
        key: "GPUMemory",
        width: "8%",
        render: (text) => {
          return <span>{text}G</span>;
        },
      },
      {
        title: "最大负载",
        dataIndex: "MaxLoad",
        key: "MaxLoad",
        width: "8%",
      },
      {
        title: "描述",
        dataIndex: "Description",
        key: "Description",
        ellipsis: true,
      },
      {
        title: "启用状态",
        dataIndex: "Enable",
        key: "Enable",
        width: "8%",
        render: (text) => {
          if (text) {
            return <span className={style.enableAlgo}>已启用</span>;
          }
          return <span className={style.disableAlgo}>未启用</span>;
        },
      },
      {
        title: "部署详情",
        dataIndex: "detail",
        key: "detail",
        width: "10%",
        // eslint-disable-next-line no-unused-vars
        render: (text) => {
          return (
            <Link to="#">
              <span>查看详情</span>
            </Link>
          );
        },
      },
    ];

    const { tableData } = this.state;
    return (
      <div className={style.mainContent}>
        <div className={style.BreadcrumbPart}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/algorithms">
              <PictureOutlined />
              <span>algorithms</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={style.tableLayer}>
          <Table
            rowKey={(record) => record.name}
            columns={columns}
            pagination={{ position: [bottom] }}
            dataSource={tableData}
          />
        </div>
      </div>
    );
  }
}

export default AlgorithmComponent;
