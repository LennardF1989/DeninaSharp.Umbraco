//NOTE: Fool the IDE
var angular = angular;

app.factory("DeninaSharpFactory", function ($http) {
    return {
        getAllCommands: function () {
            return $http.get("/umbraco/DeninaSharp/CommandApi/GetAllCommands");
        },
        preview: function (commands, template) {
            return $http.post("/umbraco/DeninaSharp/CommandApi/Preview", {
                commands: commands,
                template: template
            });
        }
    };
});

// ReSharper disable once InconsistentNaming
app.controller("DeninaSharpController", function ($scope, DeninaSharpFactory, notificationsService, $element) {
    var commands = [];

    $scope.loaded = false;

    $scope.commandProperty = {
        "label": "Commands",
        "description": "Filters to apply to the text.",
        "alias": "commands"
    };

    $scope.properties = [
        {
            "label": "Template",
            "description": "Template to render the text. Added as a variable called \"$template\".",
            "alias": "template",
            "view": "textarea",
            "value": $scope.model.value.template
        },
        {
            "label": "CSS",
            "description": "CSS rules that should be scoped to only this element.",
            "alias": "css",
            "view": "textarea",
            "value": $scope.model.value.css
        },
        {
            "label": "Error Behavior",
            "description": "How to handle errors in execution.",
            "alias": "errorBehavior",
            "view": "dropdownFlexible",
            "config": {
                "items": [
                    "Display",
                    "Hide",
                    "Throw",
                    "ErrorDebug",
                    "ErrorComment"
                ]
            },
            "value": $scope.model.value.errorBehavior
        },
        {
            "label": "Error Content",
            "description": "Content to display in the event of an error.",
            "alias": "errorContent",
            "view": "textarea",
            "value": $scope.model.value.errorContent
        },
        {
            "label": "Cache Timeout (Minutes)",
            "description": "Amount of time (in minutes) to cache the content.",
            "alias": "cacheTimeout",
            "view": "decimal",
            "value": $scope.model.value.cacheTimeout
        }
    ];

    function init() {
        DeninaSharpFactory
            .getAllCommands()
            .then(function (response) {
                var data = response.data;

                commands = data.map(function (command) {
                    return {
                        name: command.Name,
                        description: command.Description,
                        arguments: command.Arguments ? command.Arguments.map(function (argument) {
                            return {
                                label: argument.Name + (argument.Required ? " (required)" : ""),
                                description: argument.Description,
                                alias: argument.Name,
                                required: argument.Required,
                                value: undefined,
                                propertyErrorMessage: "This argument is required!"
                            };
                        }) : []
                    };
                });

                loadModelValue();

                $scope.loaded = true;
            })
            .catch(function () {
                notificationsService.error("DeninaSharp", "Failed to load all commands.");
            });
    }

    function loadModelValue() {
        //NOTE: Sanity-check
        $scope.model.value = (typeof ($scope.model.value) !== "object")
            ? {}
            : $scope.model.value;

        $scope.commands = $scope.model.value.commands || [];
    }

    $scope.addCommand = function () {
        $scope.showCommandsOverlay(undefined, function (strippedModel) {
            $scope.commands.push(strippedModel);
        });
    };

    $scope.updateCommand = function (command) {
        var originalCommand = commands.find(x => x.name === command.name);

        if (!originalCommand) {
            return;
        }

        var copyCommand = angular.copy(originalCommand);

        if (command.arguments) {
            for (var i = 0; i < copyCommand.arguments.length; i++) {
                var originalArgument = copyCommand.arguments[i];
                var argument = command.arguments.find(x => x.alias === originalArgument.alias);

                if (!argument || !argument.value) {
                    continue;
                }

                originalArgument.value = argument.value;
            }
        }

        $scope.showCommandsOverlay(function () {
            $scope.commandsOverlay.command = copyCommand;
            $scope.commandsOverlay.comment = command.note;
            $scope.commandsOverlay.input = command.input;
            $scope.commandsOverlay.output = command.output;
        }, function (strippedModel) {
            var originalIndex = $scope.commands.indexOf(command);

            if (originalIndex < 0) {
                return;
            }

            $scope.commands.splice(originalIndex, 1, strippedModel);
        });
    };

    $scope.showCommandsOverlay = function (beforeOpen, afterSubmit) {
        $scope.commandsOverlay = {};
        $scope.commandsOverlay.title = "DeninaSharp";
        $scope.commandsOverlay.subtitle = "Add a new command";
        $scope.commandsOverlay.view = "/App_Plugins/DeninaSharp/views/deninasharp.overlay.html";
        $scope.commandsOverlay.commands = angular.copy(commands);
        $scope.commandsOverlay.show = true;

        if (beforeOpen) {
            beforeOpen();
        }

        $scope.commandsOverlay.submit = function (model) {
            var strippedModel = {
                name: model.command.name,
                note: model.comment,
                input: model.input,
                output: model.output,
                arguments: model.command.arguments
                    .filter(function (argument) {
                        return argument.required || argument.value;
                    })
                    .map(function (argument) {
                        return {
                            alias: argument.alias,
                            value: argument.value
                        };
                    })
            };

            if (afterSubmit) {
                afterSubmit(strippedModel);
            }

            $scope.commandsOverlay.show = false;
        };

        return false;
    };

    $scope.sortableCommandOptions = {
        items: "> .sortable-command",
        placeholder: "ui-sortable-placeholder",
        handle: "> div",
        distance: 10,
        tolerance: "pointer",
        scrollSensitivity: 100,
        cursorAt: {
            top: 0,
            left: 0
        },

        helper: function (event, item) {
            return item.clone().removeAttr("class").html(item.find(".title").text());
        }
    };

    var insideSortable = false;
    var sortableOptions = {
        start: function (event, ui) {
            angular.element("body").addClass("ui-sortable-dragging");

            ui.item.addClass("ui-sortable-draggeditem");
        },

        over: function (event, ui) {
            ui.helper.addClass("enabled");

            angular.element(event.target).addClass("ui-sortable-hovered");

            insideSortable = true;
        },

        out: function (event, ui) {
            if (ui.helper) {
                ui.helper.removeClass("enabled");
            }

            angular.element(event.target).removeClass("ui-sortable-hovered");

            insideSortable = false;
        },

        beforeStop: function (event, ui) {
            if (!insideSortable) {
                ui.item.sortable.cancel();
            }
        },

        stop: function (event, ui) {
            angular.element("body").removeClass("ui-sortable-dragging");

            ui.item.removeClass("ui-sortable-draggeditem");
        }
    };

    angular.extend($scope.sortableCommandOptions, sortableOptions);

    $scope.$on("formSubmitting", function () {
        $scope.model.value = {
            commands: $scope.commands
        };

        for (var i = 0; i < $scope.properties.length; i++) {
            var property = $scope.properties[i];

            $scope.model.value[property.alias] = property.value;
        }
    });

    $scope.activeCommand = undefined;

    $scope.showDeleteCommand = function (command) {
        $scope.activeCommand = command;
    };

    $scope.hideDeleteCommand = function () {
        $scope.activeCommand = undefined;
    };

    $scope.acceptDeleteCommand = function (command) {
        $scope.activeCommand = undefined;

        $scope.commands.splice($scope.commands.indexOf(command), 1);
    };

    $scope.copyPasteCommand = undefined;

    $scope.copyCommand = function (command) {
        $scope.copyPasteCommand = command;

        notificationsService.info("DeninaSharp", "Copied command to clipboard!");
    };

    $scope.pasteCommand = function (command) {
        var index = $scope.commands.indexOf(command);

        $scope.commands.splice(index + 1, 0, angular.copy($scope.copyPasteCommand));

        $scope.copyPasteCommand = undefined;

        notificationsService.info("DeninaSharp", "Pasted command from clipboard!");
    };

    $scope.getCommentLines = function (comment) {
        return comment.split("\n");
    };

    $scope.generateArguments = function (command) {
        if (!command.arguments) {
            return "";
        }

        return command.arguments.map(x => {
            return "-" + x.alias + ":" + (x.value.indexOf(" ") >= 0 ? "\"" + x.value + "\"" : x.value);
        }).join(" ");
    };

    $scope.previewHtml = undefined;
    $scope.preview = function () {
        $scope.previewLoading = true;

        DeninaSharpFactory
            .preview($scope.commands, $scope.properties[0].value)
            .then(function (response) {
                var data = response.data;

                if (data.originalException) {
                    if (data.CurrentCommandName) {
                        createPreview(data.CurrentCommandName + ": " + data.Message);
                    }
                    else {
                        createPreview("Unknown: " + data.originalException.Message);
                    }
                }
                else {
                    createPreview(data);
                }
            }).catch(function (data) {
                if (data.Message) {
                    createPreview("Unknown: " + data.Message());
                }
                else {
                    createPreview("Unknown: " + data);
                }
            }).finally(function () {
                $scope.previewLoading = false;
            });
    };

    function createPreview(contents) {
        $element
            .find(".preview")
            .empty()
            .append(angular.element("<style>" + $scope.properties[1].value + "</style>"))
            .append(angular.element("<div>" + contents + "</div>"));
    }

    init();
});

app.controller("DeninaSharpOverlayController", function ($scope) {
    $scope.commandProperty = {
        label: "Command",
        description: "Pick a command",
        alias: "command",
        propertyErrorMessage: "A command is required!"
    };

    $scope.commentProperty = {
        label: "Comment",
        description: "Optionally, set a comment.",
        alias: "comment"
    };

    $scope.inputProperty = {
        label: "Input variable",
        description: "Optionally, set an input variable to process instead of the global variable.",
        alias: "input"
    };

    $scope.outputProperty = {
        label: "Output variable",
        description: "Optionally, set an output variable to write the result to instead of the global variable.",
        alias: "output"
    };
});