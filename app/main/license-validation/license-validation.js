
let crypto = require('crypto');
let Store = require('electron-store');
const hddserial = require('hddserial');
const isOnline = require('is-online');
const http = require('http');
const Config = require('../../../config/config');
const LicenceConstants = require('../constants/Licence-constants');

const LicenseValidation = new function () {
    let store = new Store();
    let iv, key;
    let userInfo = null;
    let hostName = Config.getProperty('hostName');
    let port = Config.getProperty('port');

    this.getUserStatus = async function () {
        if (userInfo == null) {
            userInfo = store.get('userInfo');
        }
        let isOnlineResult = await isOnline();
        let result;
        if (userInfo === undefined) {
            //if user is firstTime
            if (isOnlineResult) {
                return 'userFirstTime';
            } else {
                return 'internetConnectionNeeded';
            }
        } else {
            //already loggged in user
            if (isOnlineResult) {
                result = await checkUserOnline(userInfo);
            } else {
                result = await checkUserOffline(userInfo);
            }
        }
        return result;
    }

    const checkUserOffline = function (userInfo) {
        return new Promise((resolve, reject) => {
            hddserial.first(function (err, hdd) {
                try {
                    key = hdd.toString('hex').repeat(3).substring(0, 32);
                    let iv = Buffer.alloc(16, 0);
                    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let integrityCheckStr = userInfo.integrityCheckString;
                    var decryptedCheckStr = decipher.update(integrityCheckStr, 'hex', 'utf8') + decipher.final('utf8');
                    if (decryptedCheckStr !== LicenceConstants.integrityCheckString) {
                        resolve('invalidUser');
                    }
                    let encryptedAppCount = userInfo.appCount;
                    decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let decryptedAppCount = decipher.update(encryptedAppCount, 'hex', 'utf8') + decipher.final('utf8');
                    if (decryptedAppCount > LicenceConstants.maxAppCount) {
                        resolve('internetConnectionNeeded');
                    }
                    let encryptedCurrentTimestamp = userInfo.currentTimestamp;
                    decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let decryptedCurrentTimestamp = decipher.update(encryptedCurrentTimestamp, 'hex', 'utf8') + decipher.final('utf8');
                    let currentTimestamp = Date.now();
                    if (currentTimestamp <= decryptedCurrentTimestamp) {
                        resolve('invalidUser');
                    }
                    let encryptedExpiryTimestamp = userInfo.expiryTimestamp;
                    decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let decryptedExpiryTimestamp = decipher.update(encryptedExpiryTimestamp, 'hex', 'utf8') + decipher.final('utf8');
                    if (currentTimestamp >= decryptedExpiryTimestamp) {
                        resolve('licenceRenew');
                    }

                    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                    userInfo.currentTimestamp = cipher.update(currentTimestamp.toString(), 'utf8', 'hex') + cipher.final('hex');
                    let currAppCount = +decryptedAppCount + 1;
                    cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                    userInfo.appCount = cipher.update(currAppCount.toString(), 'utf8', 'hex') + cipher.final('hex');;
                    store.set('userInfo', userInfo);

                    resolve('validUser');
                }
                catch (error) {
                    console.error('Error while checking offline : ', error);
                    resolve('appError');
                }
            });


        })

    }

    const checkUserOnline = function (userInfo) {

        return new Promise(async (resolve, reject) => {

            hddserial.first(function (err, hdd) {// get hardware serial number which is encryption key
                try {
                    if (err != null) {
                        throw new Error('error in fetching hardware serial number');
                    }
                    key = hdd.toString('hex').repeat(3).substring(0, 32);
                    let iv = Buffer.alloc(16, 0);// initialisation vector for encypt/decrypt

                    //check for integrity of file
                    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let integrityCheckStr = userInfo.integrityCheckString;
                    var decryptedCheckStr = decipher.update(integrityCheckStr, 'hex', 'utf8') + decipher.final('utf8');
                    if (decryptedCheckStr !== LicenceConstants.integrityCheckString) {
                        resolve('invalidUser');
                    }

                    //get systemId
                    decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let encryptedSystemId = userInfo.systemId;
                    let systemId = decipher.update(encryptedSystemId, 'hex', 'utf8') + decipher.final('utf8');

                    //check with server
                    const options = {
                        hostname: hostName,
                        port: port,
                        path: '/customers/check?systemAddress=' + systemId,
                        method: 'GET'
                    }

                    const req = http.request(options, res => {

                        let body = '';

                        res.on('data', (chunk) => {
                            body += chunk;
                        });

                        res.on('end', async function () {
                            try {
                                let result = JSON.parse(body);
                                // do something with JSON
                                if (result.valid) {
                                    key = hdd.toString('hex').repeat(3).substring(0, 32);
                                    let iv = Buffer.alloc(16, 0);;
                                    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                                    let currentTimestamp = result.curTimeStamp;
                                    let expiryTimestamp = result.expiryTimeStamp;
                                    let appCount = 0;

                                    //encrypt and rewrite timestamps and appCount
                                    let encryptedExpiryTimestamp = cipher.update(expiryTimestamp.toString(), 'utf8', 'hex') + cipher.final('hex');
                                    cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                                    let encryptedCurrentTimestamp = cipher.update(currentTimestamp.toString(), 'utf8', 'hex') + cipher.final('hex');
                                    cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                                    let encryptedAppCount = cipher.update(appCount.toString(), 'utf8', 'hex') + cipher.final('hex');
                                    userInfo.expiryTimestamp = encryptedExpiryTimestamp;
                                    userInfo.currentTimestamp = encryptedCurrentTimestamp;
                                    userInfo.appCount = encryptedAppCount;
                                    store.set('userInfo', userInfo);
                                    resolve('validUser');
                                } else {
                                    resolve('licenceRenew');
                                }
                            } catch (error) {
                                console.error('online user check fail : ', error);
                                throw new Error('error in online user check');
                            };
                        })
                    })

                    req.on('error', error => {
                        console.error('server call fail : ', error);
                        throw new Error('error in fetching details from server');
                    })

                    req.end();
                }
                catch (error) {
                    console.error('Error while checking online : ', error);

                    //continue with offline if online check is failed
                    checkUserOffline(userInfo).then((userStatus) => {
                        resolve(userStatus);
                    });
                }

            });
        });
    }

    this.persistData = function (userData) {
        return new Promise((resolve, reject) => {
            hddserial.first(function (err, hdd) {
                iv = Buffer.alloc(16, 0);
                key = hdd.toString('hex').repeat(3).substring(0, 32);
                let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let checkString = LicenceConstants.integrityCheckString;
                let encryptedCheckString = cipher.update(checkString, 'utf8', 'hex') + cipher.final('hex');
                let systemId = userData.systemId, expiryTimestamp = userData.expiryTimestamp;
                let currentTimestamp = userData.currentTimestamp;
                cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let encryptedSystemId = cipher.update(systemId, 'utf8', 'hex') + cipher.final('hex');
                cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let encryptedExpiryTimestamp = cipher.update(expiryTimestamp.toString(), 'utf8', 'hex') + cipher.final('hex');
                cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let encryptedCurrentTimestamp = cipher.update(currentTimestamp.toString(), 'utf8', 'hex') + cipher.final('hex');
                let appCount = 0;
                cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let encryptedAppCount = cipher.update(appCount.toString(), 'utf8', 'hex') + cipher.final('hex');
                let encryptedUserInfo = {
                    integrityCheckString: encryptedCheckString,
                    systemId: encryptedSystemId,
                    expiryTimestamp: encryptedExpiryTimestamp,
                    currentTimestamp: encryptedCurrentTimestamp,
                    appCount: encryptedAppCount
                };
                userInfo = encryptedUserInfo
                store.set('userInfo', encryptedUserInfo);
                resolve();
            });
        })

    }
}
module.exports = LicenseValidation;