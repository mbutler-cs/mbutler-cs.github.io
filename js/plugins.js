// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

// $.fn.equalizeHeight will set the heights of selected elements to the largest height.
;(function ($) {
    'use strict';
    $.fn.equalizeHeight = function(options) {
        var defaults = {},
            self = this,
            opts = $.extend(defaults, options);

        var getMaxHeight = function() {
            return (Math.max.apply(self, self.map(function(i, el) {
                $(el).css('height', 'auto');
                //console.log(i + ' ' + $(el).height());
                return $(el).height();
            }).get()));
        };

        opts.selector = $(this).selector;

        $(window).resize(function () {
            var $selected = $(opts.selector),
                maxHeight = getMaxHeight(); //as we resize the page, we have to recalc the element heights

            $selected.each(function () {
                $(this).height(maxHeight);
            });
        });

        var maxHeight = getMaxHeight();
        return this.each(function() {
            $(this).height(maxHeight);
        });
    }
})(jQuery);

/*
;(function($) {
    'use strict';
    $.fn.templateplugin = function(options) {
        var defaults = {},
            opts = $.extend(defaults, options);

        return this.each(function() {
            
        });
    }
})(jQuery);
*/