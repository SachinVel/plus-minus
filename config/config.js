const Config = new function () {
    let devConfig = {
        serverOrigin: 'http://localhost:3000',
        hostname: 'localhost',
        port: 3000,
    };
    let productionConfig = {
        serverOrigin: 'http://smartreport.in',
        hostname: 'smartreport.in',
        port: 8080
    }
    this.getProperty = function (propertyName) {
        if (process.env.NODE_ENV == 'production') {
            return productionConfig[propertyName];
        } else {
            return devConfig[propertyName];
        }
    }
}

module.exports = Config;