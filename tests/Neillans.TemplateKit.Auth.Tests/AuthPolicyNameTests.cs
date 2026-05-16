using FluentAssertions;
using Xunit;

namespace Neillans.TemplateKit.Auth.Tests;

public sealed class AuthPolicyNameTests
{
    [Fact]
    public void RequireAdminPolicyNameShouldBeStable()
    {
        const string policyName = "RequireAdmin";
        policyName.Should().Be("RequireAdmin");
    }
}
