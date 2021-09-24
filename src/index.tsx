import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("worker.js")
      .then(
        (registration) => {
          console.log("Worker registered: ", registration);
        },
        (err) => {
          console.log("Registration failed: ", err);
        }
      )
      .catch((err) => {
        console.log(err);
      });
  });
} else {
  console.log("Service worker not supported");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
