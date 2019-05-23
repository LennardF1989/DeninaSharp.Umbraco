using DeninaSharp.Umbraco.Models;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;

namespace DeninaSharp.Umbraco.Core.Property
{
    [PropertyValueType(typeof(DeninaSharpModel))]
    [PropertyValueCache(PropertyCacheValue.All, PropertyCacheLevel.Content)]
    public class DeninaSharpPropertyConverter : IPropertyValueConverter
    {
        public bool IsConverter(PublishedPropertyType propertyType)
        {
            return propertyType.PropertyEditorAlias.Equals("DeninaSharp");
        }

        public object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
        {
            var result = source.TryConvertTo<string>();

            return result.Success ? result.Result : null;
        }

        public object ConvertSourceToObject(PublishedPropertyType propertyType, object source, bool preview)
        {
            if (source == null)
            {
                return null;
            }

            return JsonConvert.DeserializeObject<DeninaSharpModel>(source as string);
        }

        public object ConvertSourceToXPath(PublishedPropertyType propertyType, object source, bool preview)
        {
            return source as string;
        }
    }
}
