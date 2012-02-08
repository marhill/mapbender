(function($) {

    var Plugin = function() {};

    $.extend(Plugin.prototype, {
        options: {},
        element: undefined,
        loadCounter: -1,

        construct: function(options) {
            if(typeof(this.options.jsonUrl) === 'undefined') {
                this.onError(undefined, 'error', 'You must set the jsonUrl option.');
            }

            $.ajax({
                url: options.jsonUrl,
                data: this.getUrlParameters(),
                dataType: 'json',
                context: this,
                success: this.onSuccess,
                error: this.onError
            });
        },

        getUrlParameters: function() {
            var map = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                map[key] = unescape(value);
            });
            return map;
        },

        onSuccess: function(json) {
            this.loadHtml(json);
            this.loadCss(json);
            this.loadConfiguration(json);
            this.loadJs(json);
        },

        loadHtml: function(json) {
            if(typeof(json.html) !== 'undefined') {
                this.element.html(json.html);
            }
        },

        loadCss: function(json) {
            if(json.assets && json.assets.css) {
                var head = $('head');
                if(!$.isArray(json.assets.css)) {
                    json.assets.css = [json.assets.css];
                }
                $.each(json.assets.css, function(k, v) {
                    if(v[0] !== '/' && json.configuration && json.configuration.assetPath) {
                        v = json.configuration.assetPath + '/' + v;
                    }
                    $('<link rel="stylesheet" type="text/css" href="' + v + '"/>')
                        .appendTo(head);
                });

            }
        },

        loadJs: function(json) {
            var self = this;
             if(json.assets && json.assets.js) {
                 if(!$.isArray(json.assets.js)) {
                    json.assets.js = [json.assets.js];
                 }
                 $.each(json.assets.js, function(k, v) {
                    if(v[0] !== '/' && json.configuration && json.configuration.assetPath) {
                        v = json.configuration.assetPath + '/' + v;
                    }
                    $('<script></script')
                        .attr('src', v)
                        .appendTo($('body'));
                 });

             }
        },

        loadConfiguration: function(json) {
            if(json.configuration) {
                Mapbender = {};
                Mapbender.configuration = json.configuration;
            }
        },

        onError: function(jqXHR, textStatus, errorThrown) {
            throw textStatus + ': ' + errorThrown;
        }

    });

    $.fn.mapbenderload = function(method) {
        var plugin = $(this).data("mapbenderload") || new Plugin();
        if(typeof(plugin[method]) === 'function') {
            if(method !== 'construct') {
                var args = Array.prototype.slice.call(arguments, 1);
                return plugin[method].apply(this, args);
            }
        } else if(typeof(method) === 'object' || typeof(method) === 'undefined') {
            $(this).data("mapbenderload",plugin);
            plugin.options = arguments[0] || {};
            plugin.element = this;
            return plugin.construct.apply(plugin, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mapbenderload');
        }
    };

})(jQuery);
