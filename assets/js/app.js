'use strict';

var myApp = angular.module('myApp', ['ngResource', 'tagger'])

.config(function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            $('#loadingscreen').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    })
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                // do something on success
                // todo hide the spinner
                $('#loadingscreen').hide();
                return response;

            }, function (response) {
                // do something on error
                // todo hide the spinner
                $('#loadingscreen').hide();
                return $q.reject(response);
            });
        };
    })
//for loading screen during ng-repeat
    .directive('myStudRepeatDirective', function(){
        return function(scope, element, attrs){
            if(scope.$last){
                $('#loadingscreen').hide();
            }else{
                $('#loadingscreen').show();
            }
        };
    })

    .directive('bsModal', ['$parse', '$compile', '$http', '$timeout', '$q', '$templateCache', function($parse, $compile, $http, $timeout, $q, $templateCache) {
    'use strict';

    return {
        restrict: 'A',
        scope: true,
        link: function postLink(scope, element, attr, ctrl) {

            var getter = $parse(attr.bsModal),
                setter = getter.assign,
                value = getter(scope);

            $q.when($templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

                // Handle response from $http promise
                if(angular.isObject(template)) {
                    template = template.data;
                }

                // Build modal object
                var id = getter(scope).replace('.html', '').replace(/[\/|\.|:]/g, "-") + '-' + scope.$id;
                var $modal = $('<div class="modal hide" tabindex="-1"></div>')
                    .attr('id', id)
                    .attr('data-backdrop', attr.backdrop || true)
                    .attr('data-keyboard', attr.keyboard || true)
                    .addClass(attr.modalClass ? 'fade ' + attr.modalClass : 'fade')
                    .html(template);

                $('body').append($modal);

                // Configure element
                element.attr('href', '#' + id).attr('data-toggle', 'modal');

                // Compile modal content
                $timeout(function(){
                    $compile($modal)(scope);
                });

                // Provide scope display functions
                scope._modal = function(name) {
                    $modal.modal(name);
                };
                scope.hide = function() {
                    $modal.modal('hide');
                };
                scope.show = function() {
                    $modal.modal('show');
                };
                scope.dismiss = scope.hide;

            });
        }
    };
}]);

angular.module('tagger',[]).directive('taggable', function(){
    return {
        restrict:'A',
        link: function (scope, element, attrs) {
            element.tagsManager({
                CapitalizeFirstLetter: false,
                preventSubmitOnEnter: true,
                typeahead: true,
                typeaheadAjaxSource: null,
                typeaheadSource: ["c++", "css", "jquery", "java", "javascript", "angularjs", "ios", "php", "android"],
                typeaheadPolling: true,
                delimeters: [9, 44, 188, 13, 32],
                backspace: [8],
                blinkBGColor_1: '#FFFF9C',
                blinkBGColor_2: '#CDE69C',
                hiddenTagListName: 'tech',
                maxTags: '6'
            });
        }
    }
});

angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', ['ui.filters', 'ui.directives', 'ui.config']);

/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.directives').directive('uiTinymce', ['ui.config', function (uiConfig) {
  uiConfig.tinymce = uiConfig.tinymce || {};
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ngModel) {
      var expression,
        options = {
          // Update model on button click
          onchange_callback: function (inst) {
            if (inst.isDirty()) {
              inst.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
          },
          // Update model on keypress
          handle_event_callback: function (e) {
            if (this.isDirty()) {
              this.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
            return true; // Continue handling
          },
          // Update model when calling setContent (such as from the source editor popup)
          setup: function (ed) {
            ed.onSetContent.add(function (ed, o) {
              if (ed.isDirty()) {
                ed.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase)
                  scope.$apply();
              }
            });
          }
        };
      if (attrs.uiTinymce) {
        expression = scope.$eval(attrs.uiTinymce);
      } else {
        expression = {};
      }
      angular.extend(options, uiConfig.tinymce, expression);
      setTimeout(function () {
        elm.tinymce(options);
      });
    }
  };
}]);