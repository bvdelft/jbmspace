var logger = (function() {
  this.level = 5;
  this.debugprint = function(source, msg, lvl) {
    if (lvl <= this.level)
      console.log("[" + source + "] " + msg);
  }
  this.log = function(source, msg) {
    this.debugprint(source, msg, 4);
  }
  this.warn = function(source, msg) {
    this.debugprint(source, msg, 3);
  }
  this.error = function(source, msg) {
    this.debugprint(source, msg, 2);
  }
  this.info = function(source, msg) {
    this.debugprint(source, msg, 1);
  }
  return this;
})();
