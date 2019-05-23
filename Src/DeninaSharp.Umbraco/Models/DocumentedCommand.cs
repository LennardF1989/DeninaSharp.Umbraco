using System.Collections.Generic;
using DeninaSharp.Core.Documentation;

namespace DeninaSharp.Umbraco.Models
{
    public class DocumentedCommand
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public List<ArgumentDoc> Arguments { get; set; }
    }
}