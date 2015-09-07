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

        // la lista de encuestas podría recuperarse de una base de datos
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

            vm.opciones = response.data;

            var filtros = []; // contiene todos los filtros definidos
            vm.opciones.preguntas.filter(function (pregunta) {
                return pregunta.filtro;
            }).forEach(function (pregunta) {
                filtros.push(pregunta.filtro);
            });

            // observa los cambios en las respuestas
            $scope.$watchCollection(function (scope) {
                // evalúa dinámicamente cada filtro y devuelve un array con los
                // resultados
                return vm.respuestas && filtros.map(function (filtro) {
                    var split = filtro.campo.split(".");
                    var val = vm.respuestas[split[0]] && vm.respuestas[split[0]][split[1]];
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
                // si hubo cambios en la evaluación de los filtros, hay que
                // aplicar dichos cambios en el modelo para mostrar u ocultar
                // las preguntas
                filtros.forEach(function (filtro, i) {
                    filtro.mostrar = newVal[i];
                });
            });
        });

        vm.toString = function (data) {
            return JSON.stringify(data);
        };
    });

})();
