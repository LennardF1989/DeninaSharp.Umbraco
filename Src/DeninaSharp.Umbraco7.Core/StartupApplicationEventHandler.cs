using Umbraco.Core;

namespace DeninaSharp.Umbraco.Core
{
    public class StartupApplicationEventHandler : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            Helper.Initialize();
        }
    }
}
