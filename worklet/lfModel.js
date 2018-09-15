var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LfModel = /** @class */ (function (_super) {
    __extends(LfModel, _super);
    function LfModel() {
        return _super.call(this) || this;
    }
    LfModel.prototype.process = function (inputs, outputs, parameters) {
        var input = inputs[0];
        var output = outputs[0];
        for (var channel = 0; channel < output.length; ++channel) {
            var outputChannel = output[channel];
            var inputChannel = input[channel];
            for (var i = 0; i < outputChannel.length; ++i) {
                outputChannel[i] = inputChannel[i] + 0.1 * (Math.random() - 0.5);
            }
        }
        console.log(inputs.length);
        return true;
    };
    return LfModel;
}(AudioWorkletProcessor));
registerProcessor("lf-model", LfModel);
