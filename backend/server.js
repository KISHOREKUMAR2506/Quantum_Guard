// // const express = require("express");
// // const http = require("http");
// // const { Server } = require("socket.io");
// // const { SerialPort, ReadlineParser } = require("serialport");

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, { cors: { origin: "*" } });

// // // 👉 Change COM3 to your Arduino Uno port
// // const port = new SerialPort({ path: "COM3", baudRate: 9600 });
// // const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// // parser.on("data", (line) => {
// //   try {
// //     const data = JSON.parse(line); // e.g. {"cps":3.4}
// //     console.log("Received:", data);

// //     // Convert CPS → CPM and µSv/h (basic formula, can adjust)
// //     const cps = data.cps || 0;
// //     const cpm = cps * 60;
// //     const uSvph = cps * 0.0057; // depends on GM tube (example factor)

// //     io.emit("newData", {
// //       cps,
// //       cpm,
// //       uSvph: parseFloat(uSvph.toFixed(3)),
// //       time: new Date().toLocaleTimeString(),
// //     });
// //   } catch (err) {
// //     console.error("Parse error:", err);
// //   }
// // });

// // server.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (you can restrict to frontend URL later)
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// 🔹 DUMMY TEST MODE: generate random data every second
setInterval(() => {
  const fakeValue = {
    cps: Math.floor(Math.random() * 200),
    cpm: Math.floor(Math.random() * 1000),
    uSvph: (Math.random() * 3).toFixed(2), // 0–3 µSv/h
    time: new Date().toLocaleTimeString(),
  };
  io.emit("newData", fakeValue); // ✅ same event name as frontend
  console.log("Sent fake data:", fakeValue);
}, 1000);


server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


// //audrino code for backend/server.js


// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const { SerialPort, ReadlineParser } = require("serialport");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// io.on("connection", (socket) => {
//   console.log("✅ New client connected");
//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected");
//   });
// });

// // Change COM3 → your Arduino port (Windows: COMx, Linux/Mac: /dev/ttyUSB0 or /dev/ttyACM0)
// const port = new SerialPort({ path: "COM3", baudRate: 9600 });

// // Read lines from Arduino
// const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// parser.on("data", (line) => {
//   console.log(" Arduino Data:", line);

//   // Example: if Arduino sends "cps:120,cpm:700,uSvph:0.85"
//   try {
//     const [cps, cpm, uSvph] = line.split(",").map(Number);
//     const data = {
//       cps: cps || 0,
//       cpm: cpm || 0,
//       uSvph: uSvph || 0,
//       time: new Date().toLocaleTimeString(),
//     };
//     io.emit("newData", data);
//   } catch (err) {
//     console.error("⚠️ Parse error:", err);
//   }
// });

// server.listen(5000, () => {
//   console.log(" Server running on http://localhost:5000");
// });

