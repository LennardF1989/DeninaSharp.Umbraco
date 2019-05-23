using System.Collections.Generic;
using DeninaSharp.Umbraco.Enums;

namespace DeninaSharp.Umbraco.Models
{
    public class DeninaSharpModel
    {
        public List<Command> Commands { get; set; }
        public string Template { get; set; }
        public string Css { get; set; }
        public ErrorBehaviors ErrorBehavior { get; set; }
        public string ErrorContent { get; set; }
        public int CacheTimeout { get; set; }
    }
}
