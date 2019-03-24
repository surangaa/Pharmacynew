using System.Web.Optimization;

namespace MyPharmacy.Web
{
  public class BundleConfig
  {
    // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
    public static void RegisterBundles(BundleCollection bundles)
    {
      bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                  "~/Scripts/jquery-{version}.js",
                  "~/Scripts/jquery-ui-{version}.js",
                  "~/Scripts/jquery.cookie.js",
                  "~/Scripts/jquery.signalR-{version}.js",
                  "~/Scripts/jquery-loader.js",
                  "~/Scripts/jquery.bootstrap.wizard.min.js",
                  "~/Scripts/toastr.js",
                  "~/Scripts/linq.min.js",
                  "~/Scripts/app/resources.js"));

      bundles.Add(new ScriptBundle("~/bundles/kendo").Include(
                  "~/Scripts/kendo/jszip.min.js",
                  "~/Scripts/kendo/kendo.web.min.js",
                  "~/Scripts/kendo/kendo.all.min.js",
                  "~/Scripts/kendo/cultures/kendo.culture.en-AU.min.js",
                  "~/Scripts/kendo/kendo.timezones.min.js"));

      bundles.Add(new ScriptBundle("~/bundles/idletimeout").Include(
            "~/Scripts/store.js",
            "~/Scripts/jquery-idleTimeout.js"));

      // Use the development version of Modernizr to develop with and learn from. Then, when you're
      // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
      bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                  "~/Scripts/modernizr-*"));

      bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js",
                "~/Scripts/bootstrap-multiselect.js",
                "~/Scripts/respond.js",
                "~/Scripts/spin.js",
                "~/Scripts/ladda.js",
                "~/Scripts/underscore.js",
                "~/Scripts/app/common.js",
                "~/Scripts/bootstrap-switch.js"));

      bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.min.css",
                "~/Content/bootstrap-multiselect.css",
                "~/Content/site.css",
                "~/Content/ladda.css",
                "~/Content/toastr.css",
                "~/Content/jquery-loader.css",
                "~/Content/bootstrap-switch/bootstrap3/bootstrap-switch.css"));

      bundles.Add(new StyleBundle("~/Content/kendo/css").Include(
                "~/Content/kendo/kendo.common-bootstrap.min.css",
                "~/Content/kendo/kendo.common-bootstrap.core.min.css",
                "~/Content/kendo/kendo.bootstrap.min.css",
                "~/Content/kendo/kendo.common.min.css",
                "~/Content/kendo/kendo.uniform.min.css",
                "~/Content/kendo/kendo.dataviz.min.css",
                "~/Content/kendo/kendo.dataviz.uniform.min.css"));

      //SmartAdmin
      bundles.Add(new StyleBundle("~/Content/SmartAdmin").Include(
                "~/Content/smartadmin-production.min.css",
                "~/Content/smartadmin-rtl.min.css",
                "~/Content/smartadmin-skins.min.css",
                "~/Content/smartadmin-production-plugins.min.css",
                "~/Content/font-awesome.min.css"));

      BundleTable.EnableOptimizations = true;
    }
  }
}
