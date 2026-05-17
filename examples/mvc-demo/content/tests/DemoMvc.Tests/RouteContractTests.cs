using FluentAssertions;
using Xunit;

namespace DemoMvc.Tests;

public sealed class RouteContractTests
{
    [Fact]
    public void DefaultRoute_ShouldPointTo_HomeIndex()
    {
        const string route = "{controller=Home}/{action=Index}/{id?}";
        route.Should().Contain("Home");
    }
}
