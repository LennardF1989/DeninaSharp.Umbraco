using System.Collections.Generic;

namespace DeninaSharp.Umbraco.Models
{
    public class Command
    {
        public class Argument
        {
            public string Alias { get; set; }
            public string Value { get; set; }
        }

        public string Name { get; set; }
        public List<Argument> Arguments { get; set; }
        public string Input { get; set; }
        public string Output { get; set; }
    }
}