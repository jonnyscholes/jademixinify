"use strict"

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
                result = mixinparser(inputString, options);
            } catch (e) {
                self.emit("error", e);
                return;
            }

            var oldMixins = eval('('+result.body+')();');
            var newMixins = '';

            // To expose the template functions to the user AND to each other mixin
            // we have to create an environment where they can be accessed and can
            // access eachother
            newMixins += '(function () {' +
                            'var main = function () {};' +
                            'main.jade_mixins = {};';

            for (var mixinName in oldMixins) {
              newMixins +=  'main.jade_mixins["'+mixinName+'"] = main["'+mixinName+'"] = function() {'+
                            'var buf = [];'+
                            'var self = this;' +
                            '('+
                            // Inside of Jade core when a a mixin is called by another
                            // mixin it renders it to the buffer and doesnt return it.
                            // This adds it to the returnef buffer.
                            // Here we also modifiy the references to reference our new environment.
                            oldMixins[mixinName].toString().replace(/jade_mixins(\[.*?);$/gm,'buf.push(self.jade_mixins$1);') +
                            ').apply(this, Array.prototype.slice.call(arguments));'+
                            'return buf.join("");' +
                            '};';
            }

            newMixins += 'return main;';
            newMixins += '})();';

            // The jade code generation has a couple of places where they deviate from using " and use '. So.. yeah.
            newMixins = newMixins.replace(/'/g,'"');

            var moduleBody = 'var jade = require("' + options.runtimePath + '");' +
                             'module.exports = ' + newMixins;

            self.queue(moduleBody);
            self.queue(null);
        }
    );
};
