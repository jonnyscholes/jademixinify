var jade = require("jade");
var Compiler = jade.Compiler;

function NewCompiler() {
  Compiler.apply(this, arguments);
  this.dynamicMixins = true;
}
NewCompiler.prototype = Object.create(Compiler.prototype);
NewCompiler.prototype.constructor = NewCompiler;

function parse(str, options){
	options.compiler = NewCompiler;
  var parsed = jade.compileClientWithDependenciesTracked(str, options);

  return {
    body: parsed.body.replace('return buf.join("");', 'return jade_mixins;'),
    dependencies: parsed.dependencies
  };
}

module.exports = parse;
