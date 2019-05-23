using System.Web.Http;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace DeninaSharp.Umbraco.Core.Controllers
{
    [PluginController("DeninaSharp")]
    public class CommandApiController : UmbracoApiController
    {
        public object GetAllCommands()
        {
            return Helper.GetAllCommands();
        }

        [HttpPost]
        public object Preview([FromBody] Helper.PreviewRequest previewRequest)
        {
            return Helper.Preview(previewRequest);
        }
    }
}
