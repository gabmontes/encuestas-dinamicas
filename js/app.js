(function () {

    var app = angular.module("encuestasApp", ["ngRoute"]);

    app.config(function ($routeProvider) {
        $routeProvider
            .when("/encuestas", {
                templateUrl: "views/lista.html",
                controller: "encuestasController",
                controllerAs: "encuestas"
            })
            .when("/encuestas/:encId/forms/:formId", {
                templateUrl: "views/encuesta.html",
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
            vm.def.preguntas.filter(function (pregunta) {
                return pregunta.filtro;
            }).forEach(function (pregunta) {
                watches.push(pregunta.filtro);
            });

            $scope.$watchCollection(function (scope) {
                return vm.resp && watches.map(function (filtro) {
                    var split = filtro.campo.split(".");
                    var val = vm.resp[split[0]] && vm.resp[split[0]][split[1]];
                    if (!val) {
                        return null;
                    }
                    switch (filtro.cond) {
                        case ">":
                            return val > filtro.ref;
                        case ">=":
                            return val >= filtro.ref;
                        case "=":
                            return val == filtro.ref;
                        case "<=":
                            return val <= filtro.ref;
                        case "<":
                            return val < filtro.ref;
                    }
                });
            }, function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                watches.forEach(function (filtro, i) {
                    filtro.mostrar = newVal[i];
                });
            });
        });

        vm.toString = function (data) {
            return JSON.stringify(data);
        };
    });

})();
