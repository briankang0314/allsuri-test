'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefaultCompat(React);

var ReplyItem = function (_a) {
    var value = _a.value, onClickReply = _a.onClickReply, _b = _a.type, type = _b === void 0 ? 'vertical' : _b;
    return (React__default.default.createElement("div", { className: "sendbird-suggested-replies__option ".concat(type), id: value, onClick: function (e) { return onClickReply(e, value); } }, value));
};
var SuggestedReplies = function (_a) {
    var replyOptions = _a.replyOptions, onSendMessage = _a.onSendMessage, _b = _a.type, type = _b === void 0 ? 'vertical' : _b;
    var _c = React.useState(false), replied = _c[0], setReplied = _c[1];
    var onClickReply = function (event, option) {
        event.preventDefault();
        onSendMessage({ message: option });
        setReplied(true);
    };
    if (replied) {
        return null;
    }
    var children = replyOptions.map(function (option, index) {
        return (React__default.default.createElement(ReplyItem, { key: index, value: option, onClickReply: onClickReply, type: type }));
    });
    return React__default.default.createElement("div", { className: "sendbird-suggested-replies ".concat(type) }, children);
};

exports.ReplyItem = ReplyItem;
exports.default = SuggestedReplies;
//# sourceMappingURL=SuggestedReplies.js.map
