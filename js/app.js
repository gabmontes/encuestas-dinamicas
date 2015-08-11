(function () {

    var app = angular.module("encuestasApp", ["ngRoute"]);

    app.config(function ($routeProvider) {
        $routeProvider
            .when("/encuestas", {
                templateUrl: "views/encuestas.html",
                controller: "encuestasController",
                controllerAs: "encuestas"
            })
            .when("/encuestas/:encId/forms/:formId", {
                templateUrl: "views/formulario.html",
                controller: "formController",
                controllerAs: "form"
            })
            .otherwise({
                redirectTo: "/encuestas"
            });
    });

    app.controller("encuestasController", function ($http) {
        var vm = this;
        $http.get("data/eah2013.json").then(function (response) {
            vm.lista = response.data;
        });
    });

    app.controller("formController", function ($routeParams, $http, $scope) {
        var vm = this;
        var encId = $routeParams.encId.toLowerCase();
        var formId = $routeParams.formId.toLowerCase();
        var formUrl = "data/" + encId + "_" + formId + ".json";
        $http.get(formUrl).then(function (response) {
            vm.def = response.data;
            var watches = [];
            vm.def.grupos.filter(function (grupo) {
                return grupo.mostrar;
            }).forEach(function (grupo) {
                watches.push(grupo.mostrar);
            });
            $scope.$watchCollection(function (scope) {
                return vm.resp && watches.map(function (mostrar) {
                    var split = mostrar.campo.split(".");
                    var val = vm.resp[split[0]] && vm.resp[split[0]][split[1]];
                    if (!val) {
                        return null;
                    }
                    switch (mostrar.cond) {
                        case ">":
                            return val > mostrar.ref;
                        case ">=":
                            return val >= mostrar.ref;
                        case "=":
                            return val == mostrar.ref;
                        case "<=":
                            return val <= mostrar.ref;
                        case "<":
                            return val < mostrar.ref;
                    }
                });
            }, function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                watches.forEach(function (mostrar, i) {
                    mostrar.ocultar = !newVal[i];
                });
            });
        });
        vm.toString = function (data) {
            return JSON.stringify(data);
        };
    });

})();
