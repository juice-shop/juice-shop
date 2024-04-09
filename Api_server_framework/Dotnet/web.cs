using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

public class GreetingController : ApiController
{
    [HttpGet]
    [Route("api/serviceStack")]
    public HttpResponseMessage Get()
    {
        var response = Request.CreateResponse(HttpStatusCode.OK, "Hello, System.Web.Http API!");

        return response;
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        var config = new HttpConfiguration();
        config.MapHttpAttributeRoutes();

        var server = new HttpServer(config);

        using (var listener = new HttpListener())
        {
            listener.Prefixes.Add("http://localhost:8080/");
            listener.Start();

            Console.WriteLine("API server is running. Listening on http://localhost:8080/");

            while (true)
            {
                var context = listener.GetContext();
                server.ProcessRequestAsync(context).Wait();
            }
        }
    }
}
