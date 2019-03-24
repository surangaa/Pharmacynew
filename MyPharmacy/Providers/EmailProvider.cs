using MyPharmacy.Core;
using NLog;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading;
namespace MyPharmacy.Web.Providers
{
  public static class EmailProvider
  {
    private static readonly Logger Log = LogManager.GetLogger("RequestLogger");
    public static void SendEmail(string toEmail, string subject, string content)
    {

      var thread = new Thread(delegate()
      {
        var smtp = new SmtpClient
        {
          Host = ConfigurationManager.AppSettings["SmtpServer"],
          Port = int.Parse(ConfigurationManager.AppSettings["SmtpPort"]),
          EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["SmtpEnableSSL"]),
          DeliveryMethod = SmtpDeliveryMethod.Network,
          UseDefaultCredentials = ConfigurationManager.AppSettings["SmtpUseDefaultCredentials"] != null && Convert.ToBoolean(ConfigurationManager.AppSettings["SmtpUseDefaultCredentials"]),
          Credentials = new NetworkCredential(ConfigurationManager.AppSettings["SmtpUserName"], ConfigurationManager.AppSettings["SmtpPassword"])
        };

        string from = ConfigurationManager.AppSettings["SmtpFromEmail"];

        if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(toEmail)) return;

        using (var message = new MailMessage(from, toEmail)
        {
          Subject = subject,
          Body = content,
          IsBodyHtml = true
        })
        {
          {
            try
            {
              smtp.Send(message);
            }
            catch (Exception ex)
            {
              Log.Fatal(ex.Message);
            }
          }
        }
      });

      thread.Start();
    }
  }
}