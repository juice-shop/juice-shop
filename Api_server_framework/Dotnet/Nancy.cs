using Nancy;

namespace example;
public class ExampleModule : NancyModule
{
    public ExampleModule()
    {
        Get("/nancy", args => "Hello, Nancy API!");
    }

    public override void AddRoutes(IEndpointRouteBuilder app)
    {
        throw new NotImplementedException();
    }
}