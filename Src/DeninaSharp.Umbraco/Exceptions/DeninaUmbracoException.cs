using System;
using DeninaSharp.Core;

namespace DeninaSharp.Umbraco.Exceptions
{
    public class DeninaUmbracoException : DeninaException
    {
        public DeninaUmbracoException()
        {
            //Do nothing
        }

        public DeninaUmbracoException(string message) 
            : base(message)
        {
            //Do nothing
        }

        public DeninaUmbracoException(string message, Exception inner) 
            : base(message, inner)
        {
            //Do nothing
        }
    }
}
