angular.module("umbraco").controller("DeninaSharpGridController", function ($scope) {

    $scope.modify = function () {
        $scope.dialog = {};
        $scope.dialog.title = "DeninaSharp";
        $scope.dialog.view = "/App_Plugins/DeninaSharp/views/deninasharp.html";
        $scope.dialog.show = true;
        $scope.dialog.value = angular.copy($scope.control.value || {});

        $scope.dialog.submit = function (model) {
            $scope.control.value = model.value;

            $scope.dialog.show = false;
            $scope.dialog = null;
        };

        $scope.dialog.close = function () {
            $scope.dialog.show = false;
            $scope.dialog = null;
        };
    };
});