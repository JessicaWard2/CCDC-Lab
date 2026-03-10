
require("dotenv").config();
const express = require("express");
const ping = require("ping");
const net = require('net')
const cors = require('cors')

const app = express();
const port = 3001;

//Add back once get all of them
/*const services = [
  { name: "ecom-http", host: "192.168.1.10", port: 80 },
  { name: "mail-pop3", host: "192.168.1.11", port: 25 },
  { name: "2022-ftp", host: "192.168.1.12", port: 21 },
  { name: "ad-dns", host: "192.168.1.13", port: 53 },
  { name: "splunk-http", host: "192.168.1.14", port: 3306 },
  { name: "2019-http", host: "192.168.1.15", port: 22 },
  { name: "mail-smtp", host: "192.168.1.11", port: 143 },
];*/


const windowsToken = process.env.WINDOWS_TOKEN;
const linuxToken = process.env.LINUX_TOKEN;
app.use(cors());

let currentStatus = {};





/*
const services = [
 { name: "ad-dns", host: "169.254.172.24", port:53},
 { name: "mail-smtp", host: "169.254.172.24", port: 139 },
 { name: "mail-pop3", host: "169.254.172.24", port: 139 },
  { name: "2022-ftp", host: "169.254.172.24", port: 139 },
  { name: "splunk-http", host: "192.168.20.11", port:8080},
  { name: "2019-http", host: "169.254.36.87", port: 80 },
  { name: "ecom-http", host: "169.254.172.24", port: 139 }
 
  { name: "ad-dns", host: "192.168.40.10", port:53},
 { name: "mail-smtp", host: "192.168.20.10", port:5355},
 { name: "mail-pop3", host: "192.168.20.10", port:9090},
  { name: "2022-ftp", host: "8.8.8.8", port:53},
  { name: "splunk-http", host: "8.8.8.8", port:53},
  { name: "2019-http", host: "8.8.8.8", port:53 },
  { name: "ecom-http", host: "8.8.8.8", port:53 }
];*/

const services = [
 { name: "ad-dns", host: "192.168.40.9", port:53},
 { name: "mail-smtp", host: "192.168.20.10", port:22},
 { name: "mail-pop3", host: "192.168.20.10", port:22},
  { name: "2022-ftp", host: "192.168.40.11", port:21},
  { name: "splunk-http", host: "192.168.20.11", port:80},
  { name: "2019-http", host: "192.168.40.10", port:80},
  { name: "ecom-http", host: "192.168.20.9", port:80}
];


//Store check history for uptime calculation
const serviceHistory = {};
services.forEach(service => {
  serviceHistory[service.name] = {
    checks: [],
    startTime: Date.now()
  };
});

// Check single service
function checkService(service) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    socket.connect(service.port, service.host, () => {
      socket.destroy();
      resolve({ ...service, alive: true });
    });

    socket.on("error", () => {
      resolve({ ...service, alive: false });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ...service, alive: false });
    });
  });
}

// Calculate uptime percentage
function calculateUptime(serviceName) {
  const history = serviceHistory[serviceName];
  if (!history || history.checks.length === 0) return 0;

  const upChecks = history.checks.filter(check => check).length;
  const totalChecks = history.checks.length;
  
  return Math.round((upChecks / totalChecks) * 100);
}

//Check all
async function checkAllServices() {
  const results = await Promise.all(
    services.map((service) => checkService(service))
  );

  //Update history and status
  results.forEach(result => {
    serviceHistory[result.name].checks.push(result.alive);
    
    if (serviceHistory[result.name].checks.length > 50) {
      serviceHistory[result.name].checks.shift();
    }
    
    //Store current status
    currentStatus[result.name] = {
      alive: result.alive,
      uptimePercent: calculateUptime(result.name)
    };
  });
}

//Run immediately
checkAllServices();

//Run every 5 seconds
setInterval(checkAllServices, 5 * 1000);

//API
app.get("/api/status", (req, res) => {
  const formattedStatus = {};
  
  services.forEach(service => {
    const history = serviceHistory[service.name];
    const latestCheck = history.checks[history.checks.length - 1];
    
    formattedStatus[service.name] = {
      alive: latestCheck || false,
      uptimePercent: calculateUptime(service.name)
    };
  });
  
  res.json(currentStatus);
});

app.post("/api/reset", (req, res) => {
  // Clear all service history
  services.forEach(service => {
    serviceHistory[service.name] = {
      checks: [],
      startTime: Date.now()
    };
  });
  
  currentStatus = {};
  
  console.log("Service history reset");
  res.json({ success: true, message: "Service history reset" });
});

// Start server
app.listen(port, () => {
  console.log(`Monitoring server running on http://localhost:${port}`);
});