import userRegisterHTML from './user-register.html';
import './user-register.css';
import toast from '../../utils/toast/toast';
import AuthenticationIndex from '../../authentication-index';

const UserRegister = new function () {
    let plusMinusDomain;
    let licenseKey;

    this.getHtmlContent = function () {
        return userRegisterHTML;
    }

    const registerUser = function (email, licenseKey) {

        if (email == null || licenseKey == null) {
            toast('error', 'Please fill the input!');
            return;
        }
        $.ajax({
            type: 'PUT',
            url: plusMinusDomain + '/customers',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({ email: email, licenceKey: licenseKey }),
            success: function (result) {
                if (result.valid) {
                    AuthenticationIndex.informMain({
                        type: 'userRegisterSuccessful',
                        systemId: result.systemId,
                        expiryTimestamp: result.expiryTimeStamp,
                        currentTimestamp: result.curTimeStamp
                    });
                } else {
                    toast('error', 'User credentials are wrong!');
                }
            },
            error: function (error) {
                toast('error', error.responseJSON.message);
            }
        });

    }

    this.setLicenseKey = function (key) {
        licenseKey = key;
    }

    this.init = function () {

        plusMinusDomain = AuthenticationIndex.getPropertyFromMain('serverOrigin');
        $('#register-btn').on('click', function (event) {
            let email = $('#user-email-input').val();
            let licenseKey = $('#license-key-input').val();
            registerUser(email, licenseKey);
        });

    }
}

export default UserRegister;