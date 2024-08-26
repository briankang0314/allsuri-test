'use strict';

var React = require('react');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefaultCompat(React);

var FeedbackIconButton = React__default.default.forwardRef(function (props, ref) {
    var children = props.children, isSelected = props.isSelected, _a = props.onClick, onClick = _a === void 0 ? function () { } : _a, _b = props.disabled, disabled = _b === void 0 ? false : _b;
    return (React__default.default.createElement("button", { className: [
            'sendbird-iconbutton__feedback',
            isSelected ? 'sendbird-iconbutton__feedback__pressed' : '',
            disabled ? 'sendbird-iconbutton__feedback__disabled' : '',
        ].join(' '), ref: ref, type: 'button', onClick: function (e) {
            onClick === null || onClick === void 0 ? void 0 : onClick(e);
        }, disabled: disabled },
        React__default.default.createElement("span", { className: [
                'sendbird-iconbutton__feedback__inner',
                isSelected ? 'sendbird-iconbutton__feedback__inner__pressed' : '',
                disabled ? 'sendbird-iconbutton__feedback__inner__disabled' : '',
            ].join(' ') }, children)));
});

module.exports = FeedbackIconButton;
//# sourceMappingURL=FeedbackIconButton.js.map
