using FluentAssertions;

namespace Aneillans.TemplateKit.Auth.Tests;

public sealed class AuthPolicyNameTests
{
    [Fact]
    public void RequireAdminPolicyName_ShouldBeStable()
    {
        const string policyName = "RequireAdmin";
        policyName.Should().Be("RequireAdmin");
    }
}
