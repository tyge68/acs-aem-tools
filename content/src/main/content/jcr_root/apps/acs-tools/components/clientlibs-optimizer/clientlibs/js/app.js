/*
 * #%L
 * ACS AEM Tools Package
 * %%
 * Copyright (C) 2013 Adobe
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

/*global angular: false */


var clientLibsOptimizerApp = angular.module('clientLibsOptimizerApp',[]);

clientLibsOptimizerApp.controller('MainCtrl', function($scope, $http, $timeout) {

    $scope.app = {
        uri: '',
        formErrors: {
            categories: false,
            types: false
        }
    };

    $scope.form = {
        categories: '',
        js: true,
        css: true
    };

    $scope.result = {
        categories: ''
    };

    $scope.notifications = [];

    $scope.$watch('form.categories', function(newValue, oldValue) {
        if(newValue && newValue.indexOf('"') >= 0) {
            $scope.form.categories = $scope.form.categories.replace(/\"/g, '');
        }
    });


    $scope.optimize = function() {
        if(!$scope.validate()) {
            $scope.result = {};
            return;
        }

        $scope.form.ck = new Date().getTime();

        $http({
            method: 'GET',
            url: $scope.app.uri,
            params: $scope.form
        }).
        success(function(data, status, headers, config) {
            $scope.result.categories = data.categories.join() || '';

            if ($scope.result.categories) {
                $scope.addNotification('success',
                    'Success! Review the optimized client library definition below');

            } else {
                $scope.addNotification('notice',
                    'No client libraries could be found. '
                     + 'Verify the provided client libraries with the provided type exist on this AEM instance.');
            }
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error',
                    + 'Error. Ensure no cyclic dependencies in the provided client libraries.');
        });

        $scope.app.formErrors = {
            categories: false,
            types: false
        };
    };

    /* Validators */
    $scope.validate = function() {
       var validCategories = $scope.validateCategories(),
           validTypes = $scope.validateTypes();

        return validCategories && validTypes;
    };

    $scope.validateCategories = function() {
        /* Categories */
        if(!$scope.form.categories || $scope.form.categories.length === 0) {
            // Categories are not valid
            $scope.app.formErrors.categories = true;
        } else {
            // Categories are valid
            $scope.app.formErrors.categories = false;
        }

        return !$scope.app.formErrors.categories;
    };

    $scope.validateTypes = function() {
        /* Types */
        if(!$scope.form.css && !$scope.form.js) {
            $scope.app.formErrors.types = true;
        } else {
            $scope.app.formErrors.types = false;
        }

        return !$scope.app.formErrors.types;
    };

    $scope.addNotification = function (type, title, message) {
        var timeout = 30000;

        if(type === 'success')  {
            timeout = timeout / 2;
        }

        $scope.notifications.push({
            type: type,
            title: title,
            message: message
        });

        $timeout(function() {
            $scope.notifications.shift();
        }, timeout);
    };
});

