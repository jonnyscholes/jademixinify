"use strict";

var through = require("through");
var mixinparser = require('./mixinparser');

module.exports = function (fileName, options) {
		if (!/\.jade$/i.test(fileName)) {
				return through();
		}

		options.runtimePath = options.runtimePath === undefined ? "jade/runtime" : options.runtimePath;

		var inputString = "";
		return through(
				function (chunk) {
						inputString += chunk;
				},
				function () {
						var self = this;

						options.filename = fileName;

						var result;
						try {
								result = mixinparser(inputString, {compileDebug: false});
						} catch (e) {
								self.emit("error", e);
								return;
						}

						var oldMixins = eval('('+result.body+')();');
						var newMixins = '{';

						for (var mixinName in oldMixins) {
							newMixins += '"' + mixinName + '":';
							newMixins += 'function() {' +
															'var buf = [];'+
															'('+
															oldMixins[mixinName].toString() +
															').apply(this, Array.prototype.slice.call(arguments));'+
															'return buf;' +
															'}';
							delete oldMixins[mixinName];

							if (Object.keys(oldMixins).length !== 0) {
								newMixins += ',';
							}
						}

						newMixins += '}';

						var moduleBody = "var jade = require(\"" + options.runtimePath + "\");\n\n" +
														 "module.exports = " + newMixins + ";";

						self.queue(moduleBody);
						self.queue(null);
				}
		);
};
