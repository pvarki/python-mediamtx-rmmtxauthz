import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './i18n';

if (__USE_GLOBAL_CSS__ == true) {
  import("./index.css");
}

// Replace entire thing with response from the actual API
const SAMPLE_DATA = {
  "data": {

  }
}


//This all allows developing with just rmdev
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
   {/*@ts-ignore */}
    <App data={SAMPLE_DATA}/>
  </React.StrictMode>
);
