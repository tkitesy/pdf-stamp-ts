var http = require("http"),
  httpProxy = require("http-proxy");

var proxy = httpProxy.createProxyServer({ changeOrigin: true });

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function (req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  console.log(req.url);
  if (req.url === "/WeatherForecast/pdf") {
    proxy.web(req, res, { target: "http://m296964f59.zicp.vip" });
    return;
  }
  proxy.web(req, res, { target: "http://127.0.0.1:5500" });
});

console.log("listening on port 5050");
server.listen(5050);
