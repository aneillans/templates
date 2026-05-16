using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MvcHost.Controllers;

public sealed class HomeController : Controller
{
    [AllowAnonymous]
    public IActionResult Index() => View();

    [Authorize(Policy = "RequireAdmin")]
    public IActionResult Admin() => View();
}
