using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("[controller]/[action]")]
public class FallbackController(IWebHostEnvironment environment) : Controller
{
    public IActionResult Index()
    {
        var indexPath = Path.Combine(environment.WebRootPath, "index.html");
        return PhysicalFile(indexPath, "text/html");
    }
}
