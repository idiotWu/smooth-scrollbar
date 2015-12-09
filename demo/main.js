(function(angular) {
    'use strict';

    var app = angular.module('demo', ['SmoothScrollbar']);

    app.controller('GetDataCtrl', function($scope, $timeout, ScrollbarService) {
        $scope.offset = {
            x: 0,
            y: 0
        };
        $scope.limit = {
            x: 0,
            y: 0
        };
        $scope.velocity = {
            x: 0,
            y: 0
        };

        $scope.loading = 'pending...';
        var paragraphTmpl = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laboriosam, accusamus laudantium nostrum minima possimus optio voluptates id dignissimos, libero voluptas nesciunt. Consequatur deleniti corporis recusandae nesciunt. Maiores dignissimos praesentium tempore.';
        var article = $scope.article = [paragraphTmpl];

        var scrollbarPromise = ScrollbarService.getInstance('getData');


        scrollbarPromise.then(function (scrollbar) {
            $scope.offset = scrollbar.offset;

            scrollbar.addListener(function(status) {
                $scope.offset = status.offset;
                $scope.velocity = status.velocity;
            });
        });

        scrollbarPromise.then(function (scrollbar) {
            var count = 0;
            scrollbar.infiniteScroll(function() {
                if (count++ > 10) {
                    $scope.loading = 'the end';
                } else {
                    $scope.loading = 'loading...';

                    $timeout(function() {
                        $scope.loading = 'pending...';
                        article.push(paragraphTmpl, paragraphTmpl);
                        scrollbar.update();
                    }, 500);
                }
            });
        });
    });
})(angular);
