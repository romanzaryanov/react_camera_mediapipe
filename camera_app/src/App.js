import logo from './logo.svg';
import './App.css';
import { Camera } from "@mediapipe/camera_utils/camera_utils.js";
import React, { useRef, useState, useEffect } from 'react';
import useEventListener from '@use-it/event-listener'
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import Webcam from "react-webcam";

function App() {

  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();
  const [bgColor, setBgColor] = useState('black')
  const [isDark, setDark] = useState(false)
  
  const width = 1280
  const height = 720

  const init = () => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    
    
   // navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      //inputVideoRef.current.srcObject = stream;
      // sendToMediaPipe();
    //});

    selfieSegmentation.setOptions({
      modelSelection: 1,
      
    });

    selfieSegmentation.onResults(onResults);

    const camera = new Camera(inputVideoRef.current, {
      onFrame: async () => {
        await selfieSegmentation.send({ image: inputVideoRef.current });
      },
      width: width,
      height: height,
      
    });
    camera.start();
  };

  useEffect(() => {
    if (inputVideoRef.current) {
      init();
    }

    
  }, [inputVideoRef.current]);

  const onResults = (results) => {
    
    contextRef.current = canvasRef.current.getContext("2d");

    contextRef.current.save();
    contextRef.current.clearRect(0, 0, width, height);
    contextRef.current.filter = "blur(0)"

    contextRef.current.drawImage(results.segmentationMask, 0, 0,
      width, height);
  
    // Only overwrite existing pixels.
    contextRef.current.globalCompositeOperation = 'source-in';
   
    contextRef.current.drawImage(
        results.image, 0, 0, width, height);

    
    //canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite missing pixels.
    contextRef.current.globalCompositeOperation = 'destination-atop';
    contextRef.current.filter = "blur(40px)"

    contextRef.current.drawImage(
      results.image, 0, 0, width, height);
    
    contextRef.current.restore();
  };
  function handler({ key }) {
    if (key == ' ') {
      const randomColor = '#' + Math.floor( Math.random() * 16777215).toString(16)
      setBgColor(randomColor)
      setDark(!isDark)
    }
  }

  useEventListener('keydown', handler);
  return (
    <div className="App">
      <video ref={inputVideoRef} width={width} height={height} />
      <canvas  ref={canvasRef} width={width} height={height} />
      <div className={ isDark ? 'darkContainer' : 'hiddenDarkContainer'} style={{background : bgColor, width:width, height:height}}></div>
    </div>
  );

  

}

export default App;
