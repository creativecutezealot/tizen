(function(exports) {
    "use strict";

    var Utils = function() {

        this.buildTemplate = function(templateSource, context) {
            var template = $(templateSource).html();
            var compiledTemplate = Handlebars.compile(template);
            var renderedHTML = compiledTemplate(context);
            return renderedHTML;
        };
    };

    exports.Utils = new Utils();

})(window);
