using System;
using System.Collections.Generic;
using System.Linq;
using DeninaSharp.Core;
using DeninaSharp.Core.Filters;
using DeninaSharp.Umbraco.Exceptions;
using DeninaSharp.Umbraco.Models;

namespace DeninaSharp.Umbraco
{
    public static class Helper
    {
        public class PreviewRequest
        {
            public List<Command> Commands { get; set; }
            public string Template { get; set; }
        }

        public static void Initialize()
        {
            Pipeline.Init();
            Pipeline.SetGlobalVariable(Http.ALLOWED_DOMAINS_VARIABLE_NAME, Http.ALL_DOMAINS_WILDCARD, true);
        }

        public static List<DocumentedCommand> GetAllCommands()
        {
            return Pipeline.CommandDocs
                .Select(x => new DocumentedCommand
                {
                    Name = x.Key,
                    Description = x.Value.Description,
                    Arguments = x.Value.Arguments
                })
                .OrderBy(x => x.Name)
                .ToList();
        }

        public static object Preview(PreviewRequest previewRequest)
        {
            try
            {
                return Render(new DeninaSharpModel
                {
                    Commands = previewRequest.Commands,
                    Template = previewRequest.Template
                });
            }
            catch (DeninaUmbracoException ex)
            {
                return new
                {
                    originalException = ex.InnerException,
                    ex.CurrentCommandName,
                    ex.CurrentCommandText,
                    ex.LogData,
                    ex.Message
                };
            }
        }

        public static string Render(DeninaSharpModel model)
        {
            Pipeline pipeline = null;

            try
            {
                pipeline = new Pipeline();

                if (!string.IsNullOrWhiteSpace(model.Template))
                {
                    pipeline.SetVariable("template", model.Template.Replace("\n", string.Empty), true);
                }

                foreach (Command command in model.Commands)
                {
                    PipelineCommand pipelineCommand = new PipelineCommand
                    {
                        FullyQualifiedCommandName = command.Name,
                        CommandArgs = command.Arguments?.ToDictionary(x => (object)x.Alias, x => x.Value) ?? new Dictionary<object, string>()
                    };

                    if (!string.IsNullOrWhiteSpace(command.Input))
                    {
                        pipelineCommand.InputVariable = command.Input;
                    }

                    if (!string.IsNullOrWhiteSpace(command.Output))
                    {
                        pipelineCommand.OutputVariable = command.Output;
                    }

                    if (command.Name.Equals(Pipeline.LABEL_COMMAND, StringComparison.InvariantCultureIgnoreCase))
                    {
                        pipelineCommand.Label = command.Arguments.First(x => x.Alias == "label").Value;
                    }
                    else if (command.Name.Equals(Pipeline.WRITE_TO_VARIABLE_COMMAND, StringComparison.InvariantCultureIgnoreCase))
                    {
                        pipelineCommand.OutputVariable = command.Arguments.First(x => x.Alias == "var").Value;
                    }
                    else if (command.Name.Equals(Pipeline.READ_FROM_VARIABLE_COMMAND, StringComparison.InvariantCultureIgnoreCase))
                    {
                        pipelineCommand.InputVariable = command.Arguments.First(x => x.Alias == "var").Value;
                    }
                    else if (command.Name.Equals("core.end", StringComparison.InvariantCultureIgnoreCase))
                    {
                        pipelineCommand.Label = Pipeline.FINAL_COMMAND_LABEL;
                    }

                    pipeline.AddCommand(pipelineCommand);
                }

                return pipeline.Execute();
            }
            catch (DeninaException ex)
            {
                throw new DeninaUmbracoException(ex.Message, ex)
                {
                    CurrentCommandName = ex.CurrentCommandName ?? pipeline?.NextCommandLabel ?? "Unknown",
                    CurrentCommandText = ex.CurrentCommandText ?? "Unknown",
                    LogData = ex.LogData
                };
            }
            catch (Exception ex)
            {
                throw new DeninaUmbracoException(ex.Message, ex)
                {
                    CurrentCommandName = "Unknown",
                    CurrentCommandText = "Unknown"
                };
            }
        }
    }
}
