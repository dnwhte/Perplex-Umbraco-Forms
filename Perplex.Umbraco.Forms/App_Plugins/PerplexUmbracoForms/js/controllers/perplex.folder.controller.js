﻿angular.module("umbraco").controller("Perplex.Form.FolderController",
    function ($scope, $routeParams, $http, formResource, perplexFormResource, navigationService, treeService, notificationsService, userService) {
        $scope.folder = null;
        $scope.forms = [];
        $scope.canEdit = false;

        var nodeId = $routeParams.id;

        // Load all forms (required to display their names, we do not store form names)	    
        formResource.getOverView()
            .then(function (response) {
                $scope.forms = response.data;

                // Load this folder
                perplexFormResource.getFolder(nodeId).then(function (response) {
                    $scope.folder = response.data;

                    // determine if editor can edit folder name
                    if ($scope.folder.parentId !== '-1') {
                        $scope.canEdit = true;
                    } else {
                        userService.getCurrentUser().then(function (user) {
                            $scope.canEdit = user.userGroups.includes('admin');
                        });
                    }

                    // Goto folder in tree 	    
                    navigationService.syncTree({ tree: "form", path: $scope.folder.relativePath, forceReload: false, activate: true });

                }, function (error) { });
            });

        $scope.update = function () {
            perplexFormResource.update($scope.folder).then(function (response) {
                // Reload folder
                navigationService.syncTree({ tree: "form", path: $scope.folder.relativePath, forceReload: true }).then(function (syncArgs) {
                    navigationService.reloadNode(syncArgs.node);

                    // Hide the tree
                    navigationService.hideNavigation();

                    notificationsService.showNotification({ type: 0, header: "Folder saved" });
                });
            });
        };

        $scope.getFormName = function (formId) {
            var form = getForm(formId);
            if (form == null) return "";

            return form.name;
        };

        $scope.getFormId = function (formId) {
            var form = getForm(formId);
            if (form == null) return "";

            return form.id;
        }

        function getForm(formId) {
            return _.find($scope.forms, { id: formId });
        }
    }
);