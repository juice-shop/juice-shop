using System;
using Carter;
using Carter.ModelBinding;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CarterApiExample
{
    public class Task
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class TasksModule : CarterModule
    {
        public TasksModule()
        {
            Get("/tasks", async (req, res) =>
            {
                // Simulate retrieving a list of tasks from a data source
                var tasks = new[]
                {
                    new Task { Id = 1, Title = "Task 1", IsCompleted = false },
                    new Task { Id = 2, Title = "Task 2", IsCompleted = true }
                };

                await res.AsJson(tasks);
            });

            Get("/tasks/{id:int}", async (req, res) =>
            {
                // Simulate retrieving a task by ID from a data source
                var taskId = req.RouteValues.As<int>("id");
                var task = new Task { Id = taskId, Title = "Task " + taskId, IsCompleted = false };

                await res.AsJson(task);
            });

            Post("/tasks", async (req, res) =>
            {
                // Simulate creating a new task and returning it
                var newTask = await req.Bind<Task>();
                newTask.Id = new Random().Next(1000); // Simulate generating a unique ID

                await res.AsJson(newTask);
            });
        }
    }

    class Program
    {
        static void Main()
        {
            var host = new WebHostBuilder()
                .ConfigureServices(services => services.AddCarter())
                .Configure(app => app.UseRouting().UseEndpoints(builder => builder.MapCarter()))
                .Build();

            host.Run();
        }
    }
}
