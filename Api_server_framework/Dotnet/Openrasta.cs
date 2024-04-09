using OpenRasta.Configuration;
using OpenRasta.Web;

namespace example;
public class Task
{
    public int Id { get; set; }
    public string Title { get; set; }
    public bool IsCompleted { get; set; }
}

public class TaskHandler
{
    public OperationResult Get()
    {
        var tasks = new[]
        {
            new Task { Id = 1, Title = "Task 1", IsCompleted = false },
            new Task { Id = 2, Title = "Task 2", IsCompleted = true }
        };

        return new OperationResult.OK { ResponseResource = tasks };
    }
}

public class Configuration : IConfigurationSource
{
    public void Configure()
    {
        ResourceSpace.Has.ResourcesOfType<Task>()
            .AtUri("/api/tasks")
            .HandledBy<TaskHandler>()
            .RenderedByJson();
    }
}


}