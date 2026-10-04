using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MvcHost.Controllers;

public sealed class HomeController : Controller
{
    [AllowAnonymous]
    public IActionResult Index() => View();

    [Authorize(Policy = "RequireAdmin")]
    public IActionResult Admin() => View();

    // Target of the cookie handler's AccessDeniedPath for signed-in users missing a role.
    [AllowAnonymous]
    public IActionResult AccessDenied() => View();

    // Target of UseExceptionHandler outside Development.
    [AllowAnonymous]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
        return View();
    }
}
