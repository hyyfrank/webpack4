import React, { Component } from "react";
import { Divider, Button, Input, message } from "antd";
import { debounce, throttle } from "throttle-debounce";
import * as style from "../../css/rectangle.less";
import APICONST from "../../services/APIConst";
import { SourceNode } from "source-map";

class CanavasRectangleComponet extends Component {
  constructor(props) {
    super(props);

    this.canvas = React.createRef();

    this.saveDetail = this.saveDetail.bind(this);

    this.initilization = this.initilization.bind(this); // set background, draw init rectangles
    this.drawRectangles = this.drawRectangles.bind(this); // init canvas with data.

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.dobuleClickHandler = this.dobuleClickHandler.bind(this);

    this.state = {
      recArrays: [],
      mouseMoveArrays:[],
      monitorImageUrl: "",
      desc: "",
      myCtx: {},
      mode:"add",
      originLen: 0,
      editMode: false,
      flag: false,
      fillcolor: "red",
      startPoint: [0, 0],
      endPoint: [0, 0],
      ratioWidth: 2,
      ratioHeight: 2,
      showup: false,
      editshowup: false,
      cssX: 0, // for the css style of showup block
      cssY: 0, // for the css style of showup block
      inputID: '',
      inputDesc: '',
      inputEditID: "",
      inputEditDesc:"",
      addRec:{},
      afterDelete: false,
      ismouseDown: false,
    };
  }

  async componentDidMount() {
    const { fillcolor } = this.state;

    const my = this.canvas.current;
    const myCtx = my.getContext("2d");
    const {BASE_URL}  = APICONST;
    const {iotCode} = this.props;
    // 配置
    myCtx.strokeStyle = fillcolor;
    myCtx.lineWidth = 1;
    const monitorImageUrl = `${BASE_URL}/?filename=picture/${iotCode}.jpg`;
    console.log("component did mount props in rectangle:"+JSON.stringify(this.props))
    console.log("did mount image url in rectangle: "+monitorImageUrl)
    await this.getImage(monitorImageUrl).then((initImage) => {
      const w = initImage.width;
      const h = initImage.height;
      this.setState({
        ratioWidth: new Number(w/960).toFixed(2),
        ratioHeight: new Number(h/540).toFixed(2),
        myCtx
      })
      myCtx.drawImage(initImage, 0, 0, w, h, 0, 0, 960, 540);
      this.drawRectangles();
    });
  }

  static getDerivedStateFromProps(prev, next) {
    // console.log(`called getDerivedStateFromProps : ${prev.IoTCode}`);
    const { BASE_URL } = APICONST;
    const { cameraID } = prev;
    const url = `${BASE_URL}/?filename=picture/${cameraID}.jpg`;
    if (cameraID === undefined) {
      return next;
    }
    return {
      monitorImageUrl: url,
      recArrays: prev.regions,
      originLen: prev.originLength
    };
  }

  componentDidUpdate() {
    // init image and add init points

    console.log(`init update called!`);
    this.initilization();
  }

  getImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(img);
      };
      img.src = url;
    });
  }

  initilization() {
    const { myCtx, monitorImageUrl } = this.state;

    if (monitorImageUrl !== "" && monitorImageUrl.indexOf("undefined") === -1) {
      // console.log("did update!");
      return this.getImage(monitorImageUrl).then((initImage) => {
        const w = initImage.width;
        const h = initImage.height;
        myCtx.drawImage(initImage, 0, 0, w, h, 0, 0, 960, 540);
        this.drawRectangles();
      });
    }
    return "";
  }

  mouseDownHandler(e) {
    if (e.nativeEvent.offsetX || e.nativeEvent.layerX) {
      const offsetX =
        e.nativeEvent.offsetX === undefined
          ? e.nativeEvent.layerX
          : e.nativeEvent.offsetX;
      const offsetY =
        e.nativeEvent.offsetY === undefined
          ? e.nativeEvent.layerY
          : e.nativeEvent.offsetY;
      this.setState({ flag: true, startPoint: [offsetX, offsetY],ismouseDown: true});
    }
  }

  mouseMoveHandler(e) {
    const { startPoint, recArrays, ratioWidth, ratioHeight, flag, originLen, inputID,inputDesc,afterDelete,ismouseDown,mouseMoveArrays } =
      this.state;
      if(ismouseDown){
        if (flag) {
          console.log("[mouse move] recArray:"+recArrays.length+"ORIGIN LEN:"+originLen)
          if(mouseMoveArrays.length>0){
            mouseMoveArrays.pop();
          }
    
          if (startPoint[0] !== 0 || startPoint[1] !== 0) {
            if (e.nativeEvent.offsetX || e.nativeEvent.layerX) {
              const offsetX =
                e.nativeEvent.offsetX === undefined
                  ? e.nativeEvent.layerX
                  : e.nativeEvent.offsetX;
              const offsetY =
                e.nativeEvent.offsetY === undefined
                  ? e.nativeEvent.layerY
                  : e.nativeEvent.offsetY;
              // TODO: check no overlapping.....
    
              const width = offsetX - startPoint[0];
              const height = offsetY - startPoint[1];
    
              const addRect = {
                ID: "mouseMoveID",
                Desc: "mouseMoveDesc",
                axis: [
                  [startPoint[0] * ratioWidth, startPoint[1] * ratioHeight],
                  [
                    startPoint[0] * ratioWidth,
                    (startPoint[1] + height) * ratioHeight
                  ],
                  [
                    (startPoint[0] + width) * ratioWidth,
                    (startPoint[1] + height) * ratioHeight
                  ],
                  [(startPoint[0] + width) * ratioWidth, startPoint[1] * ratioHeight]
                ]
              };
    
              // if (Array.isArray(recArrays)) {
                // if (recArrays.length !== originLen) {
                  console.log("[mouse move] added!")
                  mouseMoveArrays.push(addRect);
                
                this.setState({ mouseMoveArrays: [...mouseMoveArrays] });
              // }
            }
          }
        }
      }
    
  }

  mouseUpHandler(e) {
    // e.stopPropagation();
    const { myCtx, startPoint, recArrays, ratioHeight, ratioWidth,inputID,inputDesc } =
      this.state;
      this.setState({ismouseDown: false});
    if (e.nativeEvent.offsetX || e.nativeEvent.layerX) {
      const offsetX =
        e.nativeEvent.offsetX === undefined
          ? e.nativeEvent.layerX
          : e.nativeEvent.offsetX;
      const offsetY =
        e.nativeEvent.offsetY === undefined
          ? e.nativeEvent.layerY
          : e.nativeEvent.offsetY;
      if (startPoint[0] !== offsetX && startPoint[1] !== offsetY) {
        myCtx.strokeRect(
          startPoint[0],
          startPoint[1],
          offsetX - startPoint[0],
          offsetY - startPoint[1]
        );
        const width = offsetX - startPoint[0];
        const height = offsetY - startPoint[1];
        this.setState(
          {
            startPoint: [0, 0],
            recArrays,
            cssX: offsetX,
            cssY: offsetY,
            showup: true,
            inputID:"",
            inputDesc:"",
            flag: false
          },
          () => {
            this.initilization();
          }
        );
      }
    }
  }

  dobuleClickHandler(e){
    const {recArrays,ratioHeight,ratioWidth} = this.state;
    this.initilization();
    if (e.nativeEvent.offsetX || e.nativeEvent.layerX) {
      const offsetX =
        e.nativeEvent.offsetX === undefined
          ? e.nativeEvent.layerX
          : e.nativeEvent.offsetX;
      const offsetY =
        (e.nativeEvent.offsetY === undefined
          ? e.nativeEvent.layerY
          : e.nativeEvent.offsetY);
      console.log("dobule click in ["+offsetX*ratioWidth+","+offsetY*ratioHeight+"]")
      
      console.log("dobule click "+JSON.stringify(recArrays))
      const filterItem = recArrays.filter((item)=>{
         if(offsetX*ratioWidth>item.axis[0][0] && offsetX*ratioWidth<item.axis[2][0] && offsetY*ratioHeight> item.axis[0][1] && offsetY*ratioHeight<item.axis[1][1] && item.ID!=="000000000"){
          console.log(`x range: [${item.axis[0][0]},${item.axis[2][0]}]`)
          console.log(`y range: [${item.axis[0][1]},${item.axis[1][1]}]`)
           return true;
         }
      })
      if(filterItem.length>0){
        console.log("dobule clicked on item:"+JSON.stringify(filterItem));
        this.setState({
          editshowup: true,
          cssX: offsetX,
          cssY: offsetY,
          inputEditID: filterItem[0].ID,
          inputEditDesc:filterItem[0].Desc,
          curSelectedRect: filterItem[0]
        })
      }else{
        this.setState({
          editshowup: false
        })
      }
      
    }
  }

  drawRectangles() {
    const { myCtx, ratioWidth, ratioHeight, recArrays,mouseMoveArrays ,curSelectedRect} = this.state;
    // const newArr = recArrays.filter(item=>{return item.ID!=="000000000"})
    console.log("DRAW recArrays:"+JSON.stringify(recArrays));
    console.log("DRAW mouseArrays:"+JSON.stringify(mouseMoveArrays));
    console.log("selected delete id:"+JSON.stringify(curSelectedRect))

    

    for (let i = 0; i < recArrays.length; i++) {
      const { axis } = recArrays[i];

      myCtx.strokeRect(
        axis[0][0] / ratioWidth,
        axis[0][1] / ratioHeight,
        Math.abs(axis[2][0] - axis[0][0]) / ratioWidth,
        Math.abs(axis[2][1] - axis[0][1]) / ratioHeight
      );
    }
    for (let i = 0; i < mouseMoveArrays.length; i++) {
      const { axis } = mouseMoveArrays[i];

      myCtx.strokeRect(
        axis[0][0] / ratioWidth,
        axis[0][1] / ratioHeight,
        Math.abs(axis[2][0] - axis[0][0]) / ratioWidth,
        Math.abs(axis[2][1] - axis[0][1]) / ratioHeight
      );
    }
    
  }

  saveDetail() {}

  render() {
    const { cssX, cssY, showup,inputID,inputDesc,editshowup,inputEditDesc,inputEditID,recArrays,curSelectedRect,mouseMoveArrays, mode} = this.state;
   


    return (
      <div className={style.monitorArea}>
        <div className={style.btnLayer}>
          <Button type="primary" onClick={()=>{
            this.setState({recArrays: [],mouseMoveArrays:[]})
          }}>
            全部重画
          </Button>
          <Divider type="vertical" />
          <Button type="primary" onClick={this.saveDetail}>
            保存
          </Button>
        </div>

        <div className={style.monitorCanvas} id="canvasArea">
          <canvas
            ref={this.canvas}
            className={style.originalCanvas}
            id="canvas"
            onDoubleClick={this.dobuleClickHandler}
            onMouseDown={this.mouseDownHandler}
            onMouseMove={throttle(16, this.mouseMoveHandler)}
            onMouseUp={this.mouseUpHandler}
            width={960}
            height={540}
          >
            Your browser does not support the canvas element.
          </canvas>
          {showup ? (
            <div className={style.mask} style={{ top: cssY, left: cssX }}>
              <div className={style.txtLayer}>
                <div className={style.label}>ID:</div>
                <Input placeholder="id" 
                value={inputID}
                onChange={(e)=>{
                  console.log("input id val"+e.target.value);
                  
                  this.setState({
                    inputID:e.target.value
                  });
                }} defaultValue={inputID} />
              </div>
              <div className={style.txtLayer}>
                <div className={style.label}>Desc:</div>
                <Input placeholder="name" 
                value={inputDesc}
                onChange={(e)=>{
                  console.log("input desc val"+e.target.value);
                  this.setState({
                    inputDesc:e.target.value
                  });
                }}
                defaultValue={inputDesc} />
              </div>
              <div className={style.btnPart}>
                <Button
                  type="primary"
                  onClick={() => {
                    // const {recArrays,inputID,inputDesc,mode,curSelectedRect,mouseMoveArrays} = this.state;
                    
                      const item = mouseMoveArrays[0];
                      item.ID = inputID;
                      item.Desc = inputDesc;
                      recArrays.push(item);
                      console.log("after the add button is:"+JSON.stringify(recArrays))
                      this.setState({ 
                        showup: false, 
                        startPoint: [0, 0],
                        recArrays:[...recArrays]
                      });
                  }}
                  className={style.confirmBtn}
                >
                  新增
                </Button>
                
                <Button
                  type="primary"
                  onClick={() => {
                    // const {mode,mouseMoveArrays} = this.state;
                    if(mode==="add"){
                      mouseMoveArrays.pop();
                    }
                    this.setState({ showup: false, startPoint: [0, 0],afterDelete: true,mouseMoveArrays:[...mouseMoveArrays] })
                  }}
                  className={style.cancelBtn}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div />
          )}


          {editshowup ? (
            <div className={style.mask} style={{ top: cssY, left: cssX }}>
              <div className={style.txtLayer}>
                <div className={style.label}>ID:</div>
                <Input placeholder="id" 
                disabled
                value={inputEditID}
                onChange={(e)=>{
                  console.log("input edit id val"+e.target.value);
                  
                  this.setState({
                    inputEditID:e.target.value
                  });
                }} defaultValue={inputEditID} />
              </div>
              <div className={style.txtLayer}>
                <div className={style.label}>Desc:</div>
                <Input placeholder="name" 
                value={inputEditDesc}
                onChange={(e)=>{
                  console.log("input edit desc val"+e.target.value);
                  this.setState({
                    inputEditDesc:e.target.value
                  });
                }}
                defaultValue={inputEditDesc} />
              </div>
              <div className={style.btnPart}>
                <Button
                  type="primary"
                  onClick={() => {
                    // const {recArrays,inputEditID,inputEditDesc,mode,curSelectedRect,mouseMoveArrays} = this.state;
                    
                      console.log("更新一个矩形 id:"+curSelectedRect.ID)

                      const newArr = recArrays.filter(item=>{
                        return item.ID !== curSelectedRect.ID;
                      })
                      curSelectedRect.ID = inputEditID;
                      curSelectedRect.Desc = inputEditDesc;
                      newArr.push(curSelectedRect);
                     
                      console.log("[button: update]"+JSON.stringify(newArr))
                    this.setState({ 
                      editshowup: false, 
                      startPoint: [0, 0],
                      recArrays:[...newArr],
                      mode:"update"
                     });
                  }}
                  className={style.confirmBtn}
                >
                  更新
                </Button>
                <Button
                  type="primary"
                  className={style.cancelBtn}
                  onClick={() => {
                    console.log("delete the id:"+typeof(curSelectedRect.ID));
                    console.log("before del:"+JSON.stringify(recArrays))
                    console.log("before: mouseArr"+JSON.stringify(mouseMoveArrays))
                    const newArr = recArrays.filter(item=>{
                      return item.ID !== curSelectedRect.ID;
                    })
                    const newMouseArr = mouseMoveArrays.filter(item=>{
                      return item.ID !== curSelectedRect.ID;
                    })
                    console.log("AFTER del:"+JSON.stringify(newArr))
                    console.log("AFTER del mousemove:"+JSON.stringify(newMouseArr))
                   
                    this.setState({ editshowup: false, recArrays:[...newArr], mouseMoveArrays:[...newMouseArr]},()=>{
                      console.log("after delete is :"+JSON.stringify(recArrays))
                    })
                  }}
                 
                >
                  删除
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    this.setState({ editshowup: false })
                  }}
                  className={style.cancelBtn}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }
}
export default CanavasRectangleComponet;
