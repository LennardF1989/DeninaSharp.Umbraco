using DeninaSharp.Umbraco;
using Umbraco.Core.Composing;

namespace DeninaSharp.Umbraco8.Core
{
    public class StartupComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            Helper.Initialize();
        }
    }
}
