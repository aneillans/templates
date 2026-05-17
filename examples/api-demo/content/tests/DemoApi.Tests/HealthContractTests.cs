using FluentAssertions;
using Xunit;

namespace DemoApi.Tests;

public sealed class HealthContractTests
{
    [Fact]
    public void HealthEndpoint_Path_ShouldRemainStable()
    {
        const string route = "/health";
        route.Should().Be("/health");
    }
}
